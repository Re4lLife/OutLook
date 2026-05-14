"use client";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '../_lib/supabase/client';
import { getMyConversations } from '../_lib/actions/getMyConversations';
import { getOneConversation } from '../_lib/actions/getOneConversation';
import { useAuth } from './AuthContext';

const ChatContext = createContext();
const supabase = createClient();

export function ChatProvider({ children }) {
    const { user, token } = useAuth();
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentOpenChatId, setCurrentOpenChatId] = useState(null);

    const fetchChats = useCallback(async () => {
        if (!token) return;
        const res = await getMyConversations(token);
        if (res.success) setChats(res.chats);
        setIsLoading(false);
    }, [token]);

    // Initial load
    useEffect(() => {
        if (user && token) {
            fetchChats();
        }
    }, [user, token, fetchChats]);

    // Listener 1: New messages in existing chats
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('chat-list-updates')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'message' },
                (payload) => {
                    const newMessage = payload.new;

                    setChats((prevChats) => {
                        const chatIndex = prevChats.findIndex(c => c.id === newMessage.conversationId);
                        if (chatIndex === -1) return prevChats;

                        const updatedChats = [...prevChats];
                        const targetChat = { ...updatedChats[chatIndex] };

                        targetChat.messages = [newMessage];

                        if (newMessage.userId !== user.userId && newMessage.conversationId !== currentOpenChatId) {
                            targetChat.hasUnread = true;
                        } else {
                            targetChat.hasUnread = false;
                        }

                        updatedChats.splice(chatIndex, 1);
                        return [targetChat, ...updatedChats];
                    });
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, currentOpenChatId]);

    // Listener 2: Brand new conversation — fires for the OTHER person
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('new-conversation-watch')
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'conversation_member',
                    filter: `userId=eq.${user.userId}`
                },
                async (payload) => {
                    const newMember = payload.new;

                    // Silently fetch that one new conversation and prepend it
                    const res = await getOneConversation(token, newMember.conversationId);
                    if (res.success && res.chat) {
                        setChats(prev => {
                            // Avoid duplicates — if it already exists, skip
                            const alreadyExists = prev.some(c => c.id === res.chat.id);
                            if (alreadyExists) return prev;
                            return [{ ...res.chat, hasUnread: true }, ...prev];
                        });
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, token]);

    return (
        <ChatContext.Provider value={{ chats, setChats, isLoading, setCurrentOpenChatId }}>
            {children}
        </ChatContext.Provider>
    );
}

export const useChatData = () => useContext(ChatContext);
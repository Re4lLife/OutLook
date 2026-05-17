import { useEffect, useRef, useState } from 'react';
import { createClient } from '../supabase/client';

const supabase = createClient();

export function useChatRealtime({ initialData, chatId, userId }) {
    const [chat, setChat] = useState(initialData);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const typingChannelRef = useRef(null);
    const isTypingLocallyRef = useRef(false);

    // --- 0. INITIAL CHAT DATA ---
    useEffect(() => {
        setChat(initialData);
    }, [initialData]);

    // --- 1. MESSAGE REALTIME ---
    useEffect(() => {
        const channel = supabase
            .channel(`realtime:chat:${chatId}`)
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'message',
                    filter: `conversationId=eq.${chatId}`,
                },
                (payload) => {
                    const newMessage = payload.new;
                    if (newMessage.userId !== userId) {
                        setChat((prev) => ({
                            ...prev,
                            messages: [...prev.messages, {
                                id: newMessage.id,
                                content: newMessage.content,
                                createdAt: newMessage.createdAt,
                                isMe: false
                            }]
                        }));
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [chatId, userId]);

    // --- 2. TYPING REALTIME ---
    useEffect(() => {
        const channel = supabase.channel(`typing-${chatId}`);
        typingChannelRef.current = channel;

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const currentlyTyping = Object.values(state)
                    .flat()
                    .some(p => String(p.userId) !== String(userId) && p.isTyping);
                setIsOtherTyping(currentlyTyping);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ userId, isTyping: false });
                }
            });

        return () => {
            supabase.removeChannel(channel);
            typingChannelRef.current = null;
        };
    }, [chatId, userId]);

    // --- 3. TYPING HANDLER ---
    const handleTyping = () => {
        const channel = typingChannelRef.current;
        if (!channel) return;

        if (!isTypingLocallyRef.current) {
            isTypingLocallyRef.current = true;
            channel.track({ userId, isTyping: true });
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            isTypingLocallyRef.current = false;
            if (typingChannelRef.current) {
                typingChannelRef.current.track({ userId, isTyping: false });
            }
        }, 2000);
    };

    const stopTyping = () => {
        isTypingLocallyRef.current = false;
        if (typingChannelRef.current) {
            typingChannelRef.current.track({ userId, isTyping: false });
        }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };

    return { chat, isOtherTyping, handleTyping, stopTyping };
}
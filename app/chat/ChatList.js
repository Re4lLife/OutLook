"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '../_lib/supabase/client';
import { useAuth } from '../context/AuthContext';
import { getMyConversations } from '../_lib/actions/getMyConversations';
import Image from 'next/image';
import Link from 'next/link';

export const formatMessageTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const supabase = createClient();


function ChatList() {
  const { user, token, isLoading } = useAuth();
  const [chats, setChats] = useState([]);
  const params = useParams();
  const currentOpenChatId = params?.id;

  useEffect(() => {
    if (!isLoading && user) {
      const load = async () => {
        const res = await getMyConversations(token);
        if (res.success) setChats(res.chats);
      };
      load();
    }
  }, [isLoading, user, token]);


  // REALTIME UPDATE LOGIC
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chat-list-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message' },
        (payload) => {
          const newMessage = payload.new;

          setChats((prevChats) => {
            const chatIndex = prevChats.findIndex(c => c.id === newMessage.conversationId);
            if (chatIndex === -1) return prevChats;

            const updatedChats = [...prevChats];
            const targetChat = { ...updatedChats[chatIndex] };

            // Update the last message text
            targetChat.messages = [newMessage];

            // --- THE FIX LOGIC ---
            // 1. If the message is from me, NEVER show green.
            // 2. If the message is for the chat I currently have open, DON'T show green.
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


  // Add this inside ChatList component
  useEffect(() => {
    if (currentOpenChatId) {
      setChats(prev => prev.map(c =>
        c.id === currentOpenChatId ? { ...c, hasUnread: false } : c
      ));
    }
  }, [currentOpenChatId]);



  if (isLoading) {
    return (
      <div className="min-h-screen  bg-[#0d012e] flex items-center justify-center">
        <div className="text-purple-500 animate-pulse text-xs uppercase tracking-widest">
          Verifying Identity...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-full flex flex-col bg-black w-full min-w-[280px] max-w-[700px]">
      <div className="p-5 font-bold text-xl text-white">Chats</div>
      <div className="flex-1 overflow-y-auto custom-chat-scrollbar">
        {chats.map((chat) => {
          const otherUser = chat.members[0]?.user;
          const lastMsg = chat.messages[0];
          if (!otherUser) return null;

          return (
            <Link
              href={`/chat/${chat.id}`}
              key={chat.id}
              onClick={() => {
                // Clear green dot when you click the chat
                setChats(prev => prev.map(c => c.id === chat.id ? { ...c, hasUnread: false } : c));
              }}
              className="flex w-full items-center gap-3 p-4 hover:bg-zinc-900 transition border-b border-zinc-900 group"
            >
              <div className="relative w-12 h-12 shrink-0">
                <Image src={otherUser.photo} alt="" fill unoptimized className="rounded-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold truncate text-zinc-100">{otherUser.name}</h3>
                  <span className={`text-[10px] ${chat.hasUnread ? 'text-green-500 font-bold' : 'text-zinc-500'}`}>
                    {lastMsg ? formatMessageTime(lastMsg.createdAt) : ""}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <p className={`text-sm truncate ${chat.hasUnread ? 'text-white font-medium' : 'text-zinc-400'}`}>
                    {lastMsg ? lastMsg.content : "Start a conversation..."}
                  </p>

                  {/* GREEN UNREAD DOT */}
                  {chat.hasUnread && (
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default ChatList;
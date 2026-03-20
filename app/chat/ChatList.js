"use client";
import { useState, useEffect } from 'react';
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

function ChatList() {
  const { user, token, isLoading } = useAuth();
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!isLoading && user) {
      const load = async () => {
        const res = await getMyConversations(token);
        if (res.success) setChats(res.chats);
      };
      load();
    }
  }, [isLoading, user, token]);

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

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => {
          const otherUser = chat.members[0]?.user;
          const lastMsg = chat.messages[0];

          if (!otherUser) return null;

          return (
            <Link
              href={`/chat/${chat.id}`}
              key={chat.id}
              className="flex w-full items-center gap-3 p-4 hover:bg-[#032c40] transition border-b border-zinc-900 group"
            >
              <div className="relative w-12 h-12 shrink-0">
                <Image
                  src={otherUser.photo}
                  alt={otherUser.name}
                  fill
                  unoptimized
                  sizes="48px"
                  className="rounded-full border border-zinc-700 object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold truncate text-zinc-100 group-hover:text-white">
                    {otherUser.name}
                  </h3>
                  <span className="text-[10px] text-zinc-500">
                    {lastMsg ? formatMessageTime(lastMsg.createdAt) : ""}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 truncate">
                  {lastMsg ? lastMsg.content : "Start a conversation..."}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default ChatList;
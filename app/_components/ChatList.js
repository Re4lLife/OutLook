"use client";
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useChatData } from '../context/ChatContext';
import Image from 'next/image';
import Link from 'next/link';
import LoadingChats from './LoadingChats';

export const formatMessageTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};


function ChatList({ searchTerm }) {
  const { user } = useAuth();
  const { chats, isLoading, setCurrentOpenChatId } = useChatData();
  const params = useParams();
  const currentOpenChatId = params?.id;

  // Clear unread status when a chat is opened
  useEffect(() => {
    setCurrentOpenChatId(currentOpenChatId);
  }, [setCurrentOpenChatId, currentOpenChatId]);

  const filteredChats = chats.filter((chat) => {
    const otherUser = chat.members?.[0]?.user;
    if (!searchTerm) return true;
    return otherUser?.name?.toLowerCase().startsWith(searchTerm.toLowerCase());
  });

  if (!user) return null;

  // SKELETON LOGIC: Only show if loading AND we have zero data
  if (isLoading && chats.length === 0) {
    const opacities = [1, 0.7, 0.45, 0.25, 0.15, 0.05];
    return (
      <div className="flex flex-col h-full bg-black">
        {opacities.map((op, i) => <LoadingChats key={i} opacity={op} />)}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black w-full min-w-[280px] max-w-[700px]">
      <div className="flex-1 overflow-y-auto custom-chat-scrollbar">
        {filteredChats.map((chat) => {
          const otherUser = chat.members[0]?.user;
          const lastMsg = chat.messages[0];
          if (!otherUser) return null;

          return (
            <Link
              href={`/chat/${chat.id}`}
              key={chat.id}
              className={`flex w-full items-center gap-3 p-4 hover:bg-zinc-900 transition border-b border-zinc-900 group ${currentOpenChatId === chat.id ? 'bg-zinc-900' : ''
                }`}
            >
              {/* Image and Content mapping here - Same as your original code */}
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
                  {chat.hasUnread && (
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                  )}
                </div>
              </div>
            </Link>
          );
        })}
        {filteredChats.length === 0 && searchTerm.length != 0 &&
          <p
            className='text-sm italic text-gray-400 flex justify-center mt-[15vh]'>
            There is no result for the search &ldquo;{searchTerm}&rdquo;
          </p>
        }
        {searchTerm.length === 0 && chats.length === 0 &&
          <p
            className='text-sm italic text-gray-400 flex items-center tracking-wide justify-center mt-[15vh]'>
            Click on the <span className='text-xl text-purple-600 font-bold mx-1'>+</span> icon and add a friend. 
          </p>
        }
      </div>
    </div>
  );
}

export default ChatList;
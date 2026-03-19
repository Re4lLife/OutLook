"use client"
import { createClient } from '../../_lib/supabase/client';
import { useEffect, useOptimistic, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { sendMessage } from '../../_lib/actions/sendMessage';

const supabase = createClient();


export default function ChatInterface({ initialData, userId, chatId }) {
    const [chat, setChat] = useState(initialData);
    const [text, setText] = useState("");
    const scrollRef = useRef(null);

    useEffect(() => {
        // 1. Create a channel for this specific conversation
        const channel = supabase
            .channel(`realtime:chat:${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'message',
                    filter: `conversationId=eq.${chatId}`, // Only listen to THIS chat
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

        // 3. CLEANUP: Leave the room when the user switches chats
        return () => {
            supabase.removeChannel(channel);
        };
    }, [chatId, userId]);


    //......................................
    const [optimisticMessages, addOptimisticMessage] = useOptimistic(
        chat.messages,
        (state, newMessage) => [...state, newMessage]
    );

    //......................................
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [optimisticMessages]);


    //........................................
    useEffect(() => {
        setChat(initialData);
    }, [initialData]);


    //........................................
    async function handleAction(formData) {
        const content = formData.get("message");
        if (!content || !content.trim()) return;

        const placeholderMsg = {
            id: Math.random().toString(), // temporary ID
            content: content,
            createdAt: new Date().toISOString(),
            senderName: "Me",
            isMe: true,
            sending: true,
        };

        addOptimisticMessage(placeholderMsg);

        const res = await sendMessage(chatId, userId, content);

        if (res.error) {
            console.error(res.error);
            // Maybe revert the text so the user can try again
            setText(content);
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#050505] w-full items-center">
            <header className="w-full border-b border-zinc-800 bg-[#050505]/90 backdrop-blur-md sticky top-0 z-10 flex justify-center">
                <div className="w-full max-w-4xl p-3 flex items-center justify-between">
                    {/* Header Content (Same as before, using chat.details) */}
                    <div className="flex items-center gap-4">
                        <Link href="/chat" className="md:hidden text-zinc-400">←</Link>
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10">
                                {chat.details?.photo ? (
                                    <Image src={chat.details.photo} fill className="rounded-full object-cover" unoptimized alt="" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold">
                                        {chat.details?.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-base">{chat.details?.name}</h2>
                                <p className="text-[11px] text-green-500">online</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div ref={scrollRef} className="flex-1 w-full overflow-y-auto scroll-smooth custom-chat-scrollbar">
                <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
                    {optimisticMessages.map((m) => (
                        <div key={m.id} className={`flex ${m.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${m.isMe ? 'bg-purple-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
                                }`}>
                                <p className="text-[15px]">{m.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* INPUT AREA */}
            <div className="w-full border-t border-zinc-800 p-4 bg-[#050505]">
                <form 
                action={handleAction} 
                onSubmit={() => setText("")}
                className="max-w-4xl mx-auto flex items-center gap-3">
                    <input
                        name="message"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-1 bg-zinc-900 text-white p-3.5 rounded-2xl outline-none border border-transparent focus:border-zinc-800 transition-all placeholder:text-zinc-600"
                        placeholder="Write a message..."
                    />
                    <button className="bg-purple-600 hover:bg-purple-500 p-3.5 rounded-2xl transition-all active:scale-95">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
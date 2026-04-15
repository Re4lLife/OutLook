"use client"
import { createClient } from '../_lib/supabase/client';
import { useEffect, useOptimistic, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { sendMessage } from '../_lib/actions/sendMessage';
import { formatMessageTime } from './ChatList';

const supabase = createClient();

export default function ChatInterface({ initialData, userId, chatId }) {
    const [chat, setChat] = useState(initialData);
    const [text, setText] = useState("");
    const scrollRef = useRef(null);
    const [isOtherTyping, setIsOtherTyping] = useState(false);

    const typingTimeoutRef = useRef(null);
    const typingChannelRef = useRef(null);
    // NEW: We use this to stop spamming the Supabase server on every keystroke
    const isTypingLocallyRef = useRef(false);



   // --- 0. INITIAL CHAT DATA ---
    useEffect(() => {
        setChat(initialData);
    }, [initialData]);


    // --- 1. MESSAGE REALTIME ---
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
        return () => {
            supabase.removeChannel(channel);
        };
    }, [chatId, userId]);


    // --- 2. TYPING REALTIME (THE FIX) ---
    useEffect(() => {
        // Create the channel ONCE when the component loads
        const channel = supabase.channel(`typing-${chatId}`);
        typingChannelRef.current = channel;

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();

                // We use String() to ensure "123" matches 123
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

        // Start typing
        if (!isTypingLocallyRef.current) {
            isTypingLocallyRef.current = true;
            channel.track({ userId, isTyping: true });
        }

        // Stop typing timer
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            isTypingLocallyRef.current = false;
            if (typingChannelRef.current) {
                typingChannelRef.current.track({ userId, isTyping: false });
            }
        }, 2000);
    };


    // --- 4. MESSAGE ACTIONS ---
    const [optimisticMessages, addOptimisticMessage] = useOptimistic(
        chat.messages,
        (state, newMessage) => [...state, newMessage]
    );

    
    async function handleAction(formData) {
        const content = formData.get("message");
        if (!content || !content.trim()) return;

        // Instantly stop typing indicator when message is sent
        if (typingChannelRef.current) {
            isTypingLocallyRef.current = false;
            typingChannelRef.current.track({ isTyping: false });
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }

        const placeholderMsg = {
            id: Math.random().toString(),
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
            setText(content);
        }
    }


    // --- 5. SCROLL EFFECT ---
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [optimisticMessages, isOtherTyping]);

    return (
        <div className="flex flex-col h-screen bg-[#050505] w-full items-center">
            <header className="fixed top-0 left-0 right-0 z-50 pt-[calc(1rem+env(safe-area-inset-top))] md:static md:border-bottom-0 w-full bg-[#050505]/90 backdrop-blur-md flex justify-center">
                <div className="w-full max-w-4xl p-3 flex items-center justify-between">
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

            <div ref={scrollRef} className="flex-1 w-full py-[10vh] overflow-y-auto scroll-smooth custom-chat-scrollbar">
                <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
                    {optimisticMessages.map((m) => (
                        <div key={m.id} className={`flex ${m.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl relative shadow-sm ${m.isMe
                                ? 'bg-purple-600 text-white rounded-br-none'
                                : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
                                }`}>
                                <p className="text-[15px] pr-10 pb-2">{m.content}</p>

                                <div className={`text-[10px] absolute bottom-1.5 right-3 flex items-center gap-1 ${m.isMe ? 'text-purple-200' : 'text-zinc-400'
                                    }`}>
                                    {m.sending ? (
                                        <span className="animate-pulse italic">sending...</span>
                                    ) : (
                                        <span>{formatMessageTime(m.createdAt)}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* --- TYPING INDICATOR POSITIONED HERE --- */}
                    {isOtherTyping && (
                        <div className="flex justify-start w-full transition-all animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-zinc-800 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1.5 items-center shadow-sm">
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* INPUT AREA */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#050505] border-t border-zinc-900 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:static md:border-t-0 w-full">
                <form
                    action={handleAction}
                    onSubmit={() => setText("")}
                    className="max-w-4xl mx-auto flex items-center gap-3">
                    <input
                        name="message"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            handleTyping();
                        }}
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
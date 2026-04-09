"use client";
import { useState, useOptimistic, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { startNewConversation } from "../_lib/actions/startNewConversation";
import { formatMessageTime } from "./ChatList";

export default function DraftChatInterface({ draftUser, onComplete, onCancel }) {
    const { user } = useAuth();
    const [text, setText] = useState("");
    const [messages, setMessages] = useState([]);
    const scrollRef = useRef(null);

    const [optimisticMessages, addOptimisticMessage] = useOptimistic(
        messages,
        (state, newMsg) => [...state, newMsg]
    );

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [optimisticMessages]);

    async function handleAction(formData) {
        const content = formData.get("message");

        console.log("1. content:", content);
        console.log("2. user:", user);
        console.log("3. draftUser:", draftUser);

        if (!content || !content.trim()) return;

        const placeholder = {
            id: Math.random().toString(),
            content,
            createdAt: new Date().toISOString(),
            isMe: true,
            sending: true,
        };

        addOptimisticMessage(placeholder);

        const res = await startNewConversation(user.userId, draftUser.id, content);

        if (res.success) {
            onComplete(res.conversationId);
        } else {
            console.error(res.error);
            setText(content); // let user retry
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#050505] w-full items-center">
            <header className="fixed top-0 left-0 right-0 z-50 pt-[calc(1rem+env(safe-area-inset-top))] md:static md:border-bottom-0 w-full bg-[#050505]/90 backdrop-blur-md flex justify-center">
                <div className="w-full max-w-4xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onCancel} className="md:hidden text-zinc-400">←</button>
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10">
                                {draftUser.photo ? (
                                    <Image src={draftUser.photo} fill className="rounded-full object-cover" unoptimized alt="" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold">
                                        {draftUser.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-base">{draftUser.name}</h2>
                                <p className="text-[11px] text-zinc-500">@{draftUser.username}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div ref={scrollRef} className="flex-1 w-full overflow-y-auto scroll-smooth custom-chat-scrollbar">
                <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
                    {optimisticMessages.length === 0 && (
                        <p className="text-center text-zinc-600 text-sm mt-10 italic">
                            Say hello to {draftUser.name}!
                        </p>
                    )}
                    {optimisticMessages.map((m) => (
                        <div key={m.id} className={`flex ${m.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl relative shadow-sm ${m.isMe
                                ? 'bg-purple-600 text-white rounded-br-none'
                                : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
                                }`}>
                                <p className="text-[15px] pr-10 pb-2">{m.content}</p>
                                <div className={`text-[10px] absolute bottom-1.5 right-3 ${m.isMe ? 'text-purple-200' : 'text-zinc-400'}`}>
                                    {m.sending ? (
                                        <span className="animate-pulse italic">sending...</span>
                                    ) : (
                                        <span>{formatMessageTime(m.createdAt)}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#050505] border-t border-zinc-900 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:static md:border-t-0">
                <form
                    action={handleAction}
                    onSubmit={() => setText("")}
                    className="max-w-4xl mx-auto flex items-center gap-3"
                >
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
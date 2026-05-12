"use client";
import { useState } from "react";
import ChatList from "./ChatList";
import DotMenu from "./DotMenu";

export default function Chat() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="flex flex-col h-full bg-black">
            <div className="flex items-center justify-between px-5 pt-5">
                <h2 className="text-xl font-semibold text-white">Outlook</h2>
                <DotMenu />
            </div>
            <div className="p-5">
                <input
                    maxLength={20}
                    className="w-full bg-zinc-900 text-zinc-100 text-sm rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-purple-600 placeholder-zinc-500"
                    type="text"
                    placeholder="Search chats..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="p-5 font-bold text-xl text-white">Chats</div>
                <ChatList searchTerm={searchTerm} />
            </div>
        </div>
    )
}
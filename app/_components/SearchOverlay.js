"use client"
import { useState, useTransition } from "react";
import Image from "next/image";
import { getSearchedUsers } from "../_lib/actions/getSearchedUsers";

export default function SearchOverlay({ isOpen, onSelectUser }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isPending, startTransition] = useTransition();

    const handleSearch = (e) => {
        const val = e.target.value;
        setQuery(val);

        if (val.length > 0) {
            startTransition(async () => {
                const users = await getSearchedUsers(val);
                setResults(users);
            });
        } else {
            setResults([]);
        }
    };

    const handleSelect = (user) => {
        setQuery("");
        setResults([]);
        onSelectUser(user); // bubble up to ChatLayout
    };

    return (
        <div className={`absolute inset-0 bg-[#050505] z-20 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="p-6 border-b border-zinc-800">
                <input
                    type="text"
                    placeholder="Search by username..."
                    value={query}
                    onChange={handleSearch}
                    className="w-full bg-zinc-900 text-white px-5 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-purple-600 transition placeholder:text-zinc-600"
                />
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-chat-scrollbar space-y-2 pb-24">
                {isPending && <p className="text-zinc-500 text-sm text-center mt-4">Searching...</p>}
                {!isPending && query.length > 0 && results.length === 0 && (
                    <p className="text-zinc-500 text-sm text-center mt-4 italic">No users found for &ldquo;{query}&rdquo;</p>
                )}

                {results.map(user => (
                    <div
                        key={user.id}
                        onClick={() => handleSelect(user)}
                        className="flex items-center gap-4 p-3 hover:bg-zinc-900 rounded-2xl cursor-pointer transition"
                    >
                        <div className="relative w-12 h-12 shrink-0">
                            <Image src={user.photo} alt={user.username} fill unoptimized className="rounded-full object-cover" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">{user.name}</p>
                            <p className="text-zinc-500 text-xs">@{user.username}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
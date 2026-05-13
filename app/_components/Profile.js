"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "../_lib/supabase/client";
import { updateProfile } from "../_lib/actions/updateProfile";
import { PencilIcon, CheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Profile({ initialProfile, userId }) {
    const supabase = createClient();
    const [profile, setProfile] = useState(initialProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(
        initialProfile?.name === "user" ? "" : initialProfile?.name || ""
    );
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    if (!profile) return null;

    const displayName = profile.name === "user" ? profile.username : profile.name;

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);

        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;

        const { error } = await supabase.storage
            .from('profile-images')
            .upload(fileName, file);

        if (error) { console.error(error); setIsUploading(false); return; }

        const { data: { publicUrl } } = supabase.storage
            .from('profile-images')
            .getPublicUrl(fileName);

        const res = await updateProfile(userId, { photo: publicUrl });
        if (res.success) setProfile(prev => ({ ...prev, photo: publicUrl }));
        setIsUploading(false);
    };

    const handleSaveName = async () => {
        if (!newName.trim() || newName.trim() === profile.name) return setIsEditing(false);
        const res = await updateProfile(userId, { name: newName.trim() });
        if (res.success) setProfile(prev => ({ ...prev, name: newName.trim() }));
        setIsEditing(false);
    };


    const joined = new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'long', year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row">

            {/* LEFT PANEL — desktop only */}
            <div className="hidden md:flex md:w-1/2 lg:w-[55%] items-center justify-center relative overflow-hidden bg-[#050505] border-r border-zinc-900">
                <Link href="/chat" className="md:flex text-sm text-white absolute md:left-[5vw] top-[10vh] border-1 border-gray-50/30 rounded-xl py-1.5 px-3.5" type="button">
                    Back
                </Link>
                {/* Animated background glow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-2xl animate-ping" style={{ animationDuration: '4s' }} />
                </div>

                {/* Decorative content */}
                <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-purple-600/20 border border-purple-500/20 flex items-center justify-center">
                        <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Your OutLook</h2>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                            Connect with friends, share moments, and stay in touch with the people that matter most.
                        </p>
                    </div>

                    {/* chat bubbles decoration */}
                    <div className="w-full max-w-xs flex flex-col gap-3 mt-4">
                        <div className="self-end bg-purple-600/80 text-white text-xs px-4 py-2.5 rounded-2xl rounded-br-none max-w-[80%] animate-in fade-in slide-in-from-right-4 duration-700">
                            Hey! How&apos;s it going? 👋
                        </div>
                        <div className="self-start bg-zinc-800/80 text-zinc-200 text-xs px-4 py-2.5 rounded-2xl rounded-bl-none max-w-[80%] animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
                            All good! Just checked OutLook 😄
                        </div>
                        <div className="self-end bg-purple-600/80 text-white text-xs px-4 py-2.5 rounded-2xl rounded-br-none max-w-[80%] animate-in fade-in slide-in-from-right-4 duration-700 delay-500">
                            Same! Love the new design ✨
                        </div>
                    </div>
                </div>
            </div>


            {/* RIGHT PANEL — profile info */}
            <div className="flex-1 flex flex-col items-center justify-start pt-12 pb-10 px-6 overflow-y-auto">
                {/* Animated background glow */}
                <div className="items-center bottom-80 right-20 absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[500px] h-[300px] bg-purple-700/10 rounded-full blur-3xl" />
                    <div className="absolute w-[100px] h-[300px] bg-purple-500/5 rounded-full blur-2xl animate-ping" style={{ animationDuration: '4s' }} />
                </div>

                {/* Avatar */}
                <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current?.click()}>
                    <Link href="/chat" className="md:hidden text-sm text-white absolute left-[-30vw] border-1 border-gray-50/30 rounded-xl py-1.5 px-3.5" type="button">
                        Back
                    </Link>
                    <div className="w-28 h-28 md:w-32 md:h-32 relative overflow-hidden rounded-full border-2 border-zinc-800 bg-zinc-900 flex items-center justify-center">
                        {profile.photo ? (
                            <Image src={profile.photo} fill className="object-cover" alt="Profile" unoptimized />
                        ) : (
                            <span className="text-4xl font-bold text-zinc-600">
                                {displayName?.charAt(0).toUpperCase()}
                            </span>
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs z-10 text-white">
                                Uploading...
                            </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <PencilIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full border-2 border-[#050505] group-hover:scale-110 transition">
                        <PencilIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
                </div>

                {/* Name */}
                <div className="flex items-center gap-2 mb-1">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                autoFocus
                                className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 outline-none text-xl font-bold text-center text-white focus:border-purple-600 transition"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onBlur={handleSaveName}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                            />
                            <button onClick={handleSaveName} className="text-purple-400 hover:text-purple-300">
                                <CheckIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                            <button onClick={() => setIsEditing(true)} className="text-zinc-600 hover:text-purple-400 transition">
                                <PencilIcon className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>

                <p className="text-zinc-500 mb-1">@{profile.username}</p>
                <p className="text-zinc-600 text-xs mb-8">Joined {joined}</p>

                {/* Stats */}
                <div className="w-full max-w-sm grid grid-cols-1 gap-3 mb-8 text-center">
                    <h2 className="text-xl font-bold">Member since</h2>
                    {new Date(profile.createdAt).getFullYear()}
                </div>

                <div className="w-full max-w-sm h-[1px] bg-zinc-900 mb-8" />

                {/* Info rows */}
                <div className="w-full max-w-sm flex flex-col gap-3">
                    <div className="flex items-center justify-between bg-zinc-900/50  rounded-2xl px-4 py-3">
                        <span className="text-zinc-500 text-sm">Email</span>
                        <span className="text-zinc-300 text-sm">{profile.email}</span>
                    </div>
                    <div className="flex items-center justify-between bg-zinc-900/50  rounded-2xl px-4 py-3">
                        <span className="text-zinc-500 text-sm">Username</span>
                        <span className="text-zinc-300 text-sm">@{profile.username}</span>
                    </div>
                </div>

                <p className="text-zinc-700 text-xs italic mt-8">Usernames are permanent and used for search.</p>
            </div>
        </div>
    );
}
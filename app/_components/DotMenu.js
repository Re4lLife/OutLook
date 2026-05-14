"use client";
import { useState, useRef, useEffect } from 'react';
import { EllipsisVerticalIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { logout } from '../_lib/actions/logout';
import { useRouter } from 'next/navigation';
import { useChatData } from '../context/ChatContext';

export default function DotMenu() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const ref = useRef(null);
    const router = useRouter();
    const { setChats } = useChatData();


    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const handleLogout = async () => {
        setIsLoading(true);
        await logout();
        setChats([]);
        setIsLoading(false);
        localStorage.removeItem('outlook_token');
        document.cookie = 'outlook_token=; path=/; max-age=0';
        router.push('/get-started/sign-in');
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="text-zinc-500 hover:text-white transition p-1 rounded-lg hover:bg-zinc-900"
            >
                <EllipsisVerticalIcon className="h-6 w-6" />
            </button>
            {open && (
                <div className="absolute right-0 top-9 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-50 w-44 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-zinc-800 transition"
                    >
                        <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                        {isLoading ? 'Signing out...' : 'Sign out'}
                    </button>
                </div>
            )}
        </div>
    );
}
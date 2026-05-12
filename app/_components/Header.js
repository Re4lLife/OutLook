"use client"
import Image from "next/image";
import logo from "../public/logo.png"
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();
    const isChatPage = pathname.startsWith('/chat');
    const isProfilePage = pathname.startsWith('/profile');

    if (isChatPage || isProfilePage) return null;

    return (
        <header className="pt-2">
            <div className="flex items-center justify-center rounded-full p-1.5 bg-slate-400/50 w-32 mx-auto">
                <Image
                    src={logo}
                    alt="Outlook Logo"
                    width={35}
                    height={40}
                    className="h-auto w-auto"
                    priority
                />
            </div>
        </header>
    );
};


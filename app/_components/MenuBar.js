// MenuBar.js
import { PiChatsBold } from "react-icons/pi";
import { FaCirclePlus } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import Link from "next/link";

export default function MenuBar({ onToggleSearch, isSearchOpen }) {
    return (
        <div className="fixed bottom-0 flex md:flex-col justify-between items-center bg-[#050505] md:border-t-0 md:h-full w-full md:w-[70px] md:py-6 px-10 md:px-0 py-3 relative z-30 shadow-lg md:border-r-2 md:border-purple-800/10 border-t border-zinc-800 shrink-0 rounded-full">
            <Link href="/chat" className="text-zinc-400 hover:text-white transition">
                <PiChatsBold size={26} />
            </Link>

            <button 
                onClick={onToggleSearch}
                className="md:top-32 absolute left-1/2 -translate-x-1/2 -top-3 md:left-auto md:translate-x-0 rounded-full p-1"
            >
                <FaCirclePlus className={`text-purple-300 md:text-4xl text-5xl transition-transform duration-300 ${isSearchOpen ? 'rotate-45 text-red-500' : ''}`}/>
            </button>

            <Link href="/profile" className="text-zinc-400 pb-2 md:border-t pt-5 hover:text-white transition">
                <CgProfile size={26} />
            </Link>
        </div>
    );
}
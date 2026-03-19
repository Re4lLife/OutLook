"use client"
import { usePathname } from "next/navigation";
import ChatList from "../_components/ChatList";

function ChatLayout({ children }) {
  const pathname = usePathname();
  const isInsideChat = pathname.startsWith('/chat/') && pathname.length > '/chat/'.length;

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <aside className={
        isInsideChat
          ? "hidden md:flex md:w-[350px] lg:w-[440px] shrink-0 border-r border-zinc-800 h-full flex-col"
          : "flex md:w-[350px] lg:w-[440px] w-full shrink-0 border-r border-zinc-800 h-full flex-col"
      }>
        <ChatList />
      </aside>

      <main className={`flex flex-1 h-full bg-[#050505] relative min-w-0 ${!isInsideChat ? 'hidden md:flex' : ''}`}>
        {children}
      </main>
    </div>
  );
}

export default ChatLayout;
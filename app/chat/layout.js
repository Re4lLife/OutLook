"use client"
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Chat from "../_components/Chat";
import MenuBar from "../_components/MenuBar";
import SearchOverlay from "../_components/SearchOverlay";
import DraftChatInterface from "../_components/DraftChatInterface";

function ChatLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [draftUser, setDraftUser] = useState(null);
  const isInsideChat = pathname.startsWith('/chat/') && pathname.length > '/chat/'.length;

  console.log(draftUser);


  const handleSelectUser = (user) => {
    setIsSearchOpen(false);
    setDraftUser(user);
  };

  const handleDraftComplete = (newConversationId) => {
    setDraftUser(null);
    router.push(`/chat/${newConversationId}`);
  };

  const handleDraftCancel = () => {
    setDraftUser(null);
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-black">
      <aside className={
        isInsideChat || draftUser
          ? "hidden md:flex md:w-[420px] lg:w-[510px] shrink-0 border-r border-zinc-800 h-full md:flex-row relative overflow-hidden"
          : "flex md:w-[420px] lg:w-[510px] w-full shrink-0 border-r border-zinc-800 h-full md:flex-row flex-col relative overflow-hidden"
      }>

        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black border-zinc-900 pb-[env(safe-area-inset-bottom)] md:static md:border-t-0 md:pb-0 md:z-auto shrink-0">
          <MenuBar onToggleSearch={() => setIsSearchOpen(!isSearchOpen)} isSearchOpen={isSearchOpen} />
        </div>

        <div className="flex-1 flex flex-col h-full relative min-w-0 pb-[72px] md:pb-0 overflow-hidden">
          <Chat setDraftUser={setDraftUser} />
          <SearchOverlay isOpen={isSearchOpen} onSelectUser={handleSelectUser} />
        </div>
      </aside>

      <main className={`flex flex-1 h-full bg-[#050505] relative min-w-0 ${!isInsideChat && !draftUser ? 'hidden md:flex' : ''}`}>
        {draftUser ? (
          <DraftChatInterface
            draftUser={draftUser}
            onComplete={handleDraftComplete}
            onCancel={handleDraftCancel}
          />
        ) : (
          children
        )}
      </main>
    </div>
  );
}

export default ChatLayout;
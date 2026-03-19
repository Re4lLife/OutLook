
export default function NoChatSelected() {
  return (
    <div className="flex h-full w-2xl mx-auto flex-col items-center justify-center bg-[#050505] text-zinc-500">
      <div className="w-20 h-20 rounded-full bg-zinc-900/80 flex items-center justify-center border border-zinc-800">
         <span className="text-3xl">✉️</span>
      </div>
      
      <p className="text-center text-sm">
        Start a conversation with a friend.
      </p>
    </div>
  );
}


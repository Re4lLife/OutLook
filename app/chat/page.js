import useAuth from '../context/AuthContext';

function ChatPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d012e] flex items-center justify-center">
        <div className="text-purple-500 animate-pulse text-xs uppercase tracking-widest">
          Verifying Identity...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>layout component</div>
  );
};

export default ChatPage;
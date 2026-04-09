const LoadingChats = ({ opacity }) => {
    return (
        <div
            className="flex items-center gap-3 p-4 border-b border-zinc-900 animate-pulse"
            style={{ opacity }}
        >
            {/* Avatar Skeleton */}
            <div className="w-12 h-12 rounded-full bg-zinc-800 shrink-0" />

            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex justify-between">
                    {/* Name Skeleton */}
                    <div className="h-3 w-24 bg-zinc-800 rounded" />
                    {/* Time Skeleton */}
                    <div className="h-2 w-10 bg-zinc-800 rounded" />
                </div>
                {/* Message Skeleton */}
                <div className="h-3 w-full bg-zinc-800 rounded opacity-50" />
            </div>
        </div>
    );
};

export default LoadingChats;
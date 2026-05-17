import { useEffect, useRef } from 'react';

export function useScrollToBottom(dep1, dep2) {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [dep1, dep2]);

    return scrollRef;
}
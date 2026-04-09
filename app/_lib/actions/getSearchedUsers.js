"use server"
import prisma from '../prisma';

export async function getSearchedUsers(query) {
    if (!query || query.trim().length === 0) return [];
    
    try {
        const users = await prisma.user.findMany({
            where: { 
                username: { contains: query, mode: 'insensitive' } 
            },
            //Remember to take 'id' out for security reasons.
            select: { id: true, username: true, name: true, photo: true },
            take: 15
        });
        return users;
    } catch (error) {
        console.error("Search error:", error);
        return [];
    }
}
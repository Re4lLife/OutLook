"use server";
import prisma from "../prisma";
import { jwtVerify } from "jose";

export async function getMyConversations(token) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const myId = payload.userId;


    // 1. Find all conversations where I am a member
    const chats = await prisma.conversation.findMany({
      where: {
        members: { some: { userId: myId } }
      },
      include: {
        // 2. Get the OTHER members of those conversations
        members: {
          where: { userId: { not: myId } },
          include: {
            user: {
              select: { id: true, name: true, username: true, photo: true }
            }
          }
        },
        // 3. Get the latest message to show a preview in the sidebar
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    // Apply the same name fallback logic
    const processedChats = chats.map(chat => {
      if (chat.isGroup) return chat;

      const otherUser = chat.members[0]?.user;
      if (!otherUser) return chat;

      return {
        ...chat,
        members: [{
          ...chat.members[0],
          user: {
            ...otherUser,
            name: otherUser.name === "user" ? otherUser.username : otherUser.name
          }
        }]
      };
    });

    return { success: true, chats: processedChats };
  } catch (error) {
    console.log(error.message)
    return { success: false, error: "Something went wrong" };
  }
}
"use server";
import prisma from "../prisma";
import { jwtVerify } from "jose";

export async function getOneConversation(token, conversationId) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const myId = payload.userId;

    const chat = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          where: { userId: { not: myId } },
          include: {
            user: { select: { id: true, name: true, username: true, photo: true } }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!chat) return { success: false };

    return { success: true, chat };
  } catch (error) {
    console.error("getOneConversation error:", error);
    return { success: false };
  }
}
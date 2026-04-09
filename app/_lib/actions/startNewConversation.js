"use server";
import prisma from "../prisma";

export async function startNewConversation(myUserId, otherUserId, content) {
  try {
    // Check if a 1-on-1 conversation already exists between these two users
    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        members: { some: { userId: myUserId } },
        AND: { members: { some: { userId: otherUserId } } }
      },
      include: {
        members: {
          where: { userId: { not: myUserId } },
          include: { user: { select: { id: true, name: true, photo: true } } }
        },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    if (existing) {
      // Conversation already exists, just send the message
      const message = await prisma.message.create({
        data: { content: content.trim(), conversationId: existing.id, userId: myUserId }
      });
      return { success: true, conversationId: existing.id, isNew: false, message };
    }

    // Create everything in one atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.create({
        data: { isGroup: false }
      });

      await tx.conversationMember.createMany({
        data: [
          { userId: myUserId, conversationId: conversation.id },
          { userId: otherUserId, conversationId: conversation.id }
        ]
      });

      const message = await tx.message.create({
        data: { content: content.trim(), conversationId: conversation.id, userId: myUserId }
      });

      return { conversationId: conversation.id, message };
    });

    return { success: true, isNew: true, ...result };
  } catch (error) {
    console.error("startNewConversation error:", error);
    return { success: false, error: "Failed to start conversation" };
  }
}
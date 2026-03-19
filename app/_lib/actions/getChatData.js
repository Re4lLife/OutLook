"use server";
import prisma from "../prisma";

export async function getChatData(conversationId, currentUserId) {
  try {
    const chat = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, photo: true } }
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { name: true, photo: true } }
          }
        }
      }
    });

    if (!chat) return { success: false, error: "Chat not found" };

    // 1. Determine Chat Identity (Metadata)
    let chatName = chat.name;
    let chatPhoto = null;

    if (!chat.isGroup) {
      const otherMember = chat.members.find(m => m.userId !== currentUserId);
      chatName = otherMember?.user.name || "User";
      chatPhoto = otherMember?.user.photo;
    }

    // 2. Sanitize Messages
    const sanitizedMessages = chat.messages.map(m => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      senderName: m.user?.name,
      senderPhoto: m.user?.photo,
      isMe: m.userId === currentUserId,
    }));

    return {
      success: true,
      data: {
        details: { name: chatName, photo: chatPhoto, isGroup: chat.isGroup },
        messages: sanitizedMessages
      }
    };
  } catch (error) {
    console.error("Master Fetch Error:", error);
    return { success: false };
  }
}
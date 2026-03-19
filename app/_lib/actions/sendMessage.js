"use server";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";

export async function sendMessage(conversationId, userId, content) {
  try {
    if (!content.trim()) return { error: "Message cannot be empty" };

    const newMessage = await prisma.message.create({
      data: {
        content: content.trim(),
        conversationId,
        userId,
      },
      include: {
        user: { select: { name: true, photo: true } }
      }
    });

    revalidatePath(`/chat/${conversationId}`);

    return { success: "Message sent", newMessage };
  } catch (error) {
    console.error("Send Error:", error);
    return { error: "Failed to send message" };
  }
}
"use server";
import prisma from "../prisma";

export async function getProfileData(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, photo: true, email: true, createdAt: true }
    });
    if (!user) return { success: false };
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
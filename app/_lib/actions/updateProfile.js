"use server";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(userId, data) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: data,
    });
    revalidatePath("/profile");
    return { success: true, user: updatedUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
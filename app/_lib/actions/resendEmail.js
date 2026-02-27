"use server";

import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "../mail";
import prisma from "../../_lib/prisma";

export async function resendVerification(email) {
    if (!email) return { error: "Email is required." };

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) return { error: "User not found." };
        if (user.emailVerified) return { error: "Account already verified. Please sign in." };

        const newToken = uuidv4();
        
        await sendVerificationEmail(email, newToken);

        return { success: "A new link has been sent to your inbox! 📩" };
    } catch (error) {
        console.error("Resend Error:", error);
        return { error: "Failed to resend. Please try again later." };
    }
}
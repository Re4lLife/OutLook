"use server";

import prisma from "../../_lib/prisma";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signIn(prevState, formData) {
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
        return { error: "Please enter both email and password." };
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return { error: "Invalid email or password." };

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return { error: "Invalid email or password." };

        if (!user.emailVerified) {
            return { 
                error: "Your email is not verified.",
                needsVerification: true,
                email: user.email,
            };
        }

        const token = await new SignJWT({ userId: user.id, email: user.email })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("24h")
            .sign(secretKey);

        return { 
            success: "Success! Signing you in...",
            token: token
        };

    } catch (error) {
        console.error("Login Error:", error);
        return { error: "Internal server error." };
    }
}
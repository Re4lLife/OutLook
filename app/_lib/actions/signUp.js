"use server";
import prisma from "../../_lib/prisma";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "../mail";
import { emailLimiter, ipLimiter } from "../ratelimiter";
import { headers } from "next/headers";

export async function signUp(prevState, formData) {
    const username = formData.get("username");
    const email = formData.get("email")?.toLowerCase();
    const password = formData.get("password");
    const headerList = await headers()
    const ip = headerList.get("True-Client-IP");

    if (!username || !email || !password) {
        return { error: "All fields are required." };
    }

    const emailCheck = await emailLimiter.limit(email);
    const ipCheck = await ipLimiter.limit(ip);

    if (!emailCheck.success || !ipCheck.success) {
        return { error: "Too many attempts. Try again in a few seconds." };
    }

        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])/;
        if (password.length < 5 || !passwordRegex.test(password)) {
            return { error: "Password must be at least 5 characters and contain both letters and numbers." };
        }

        try {
            const existingUser = await prisma.user.findUnique({ where: { email } });

            if (existingUser) {
                if (existingUser.emailVerified) {
                    return { error: "Invalid email." };
                }

                const verificationToken = uuidv4();
                await sendVerificationEmail(email, verificationToken);

                return { success: "You already have an unverified account. We've sent a fresh verification link to your inbox! 📩" };
            }

            const existingUsername = await prisma.user.findUnique({ where: { username } });
            if (existingUsername) return { error: "This username has already been taken." };

            const hashedPassword = await bcrypt.hash(password, 10);

            await prisma.user.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    name: "user",
                },
            });

            const verificationToken = uuidv4();
            await sendVerificationEmail(email, verificationToken);

            return { success: "A confirmation email has been sent to your inbox 📩" };

        } catch (error) {
            console.error("Signup Error:", error);
            return { error: "Internal server error. Please try again." };
        }
    }
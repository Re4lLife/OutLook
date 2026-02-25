"use server";
import { redirect } from "next/navigation";
import prisma from "../../_lib/prisma";
import bcrypt from "bcrypt";

export async function signUp(prevState, formData) {
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    if (!username || !email || !password) {
        return { error: "All fields are required." };
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])/;
    if (password.length < 5 || !passwordRegex.test(password)) {
        return { error: "Password must be at least 5 characters and contain both letters and numbers." };
    }

    let isSuccess = false;

    try {
        const existingEmail = await prisma.user.findFirst({ where: { email } });
        if (existingEmail) return { error: "This user already exists." };

        const existingUsername = await prisma.user.findFirst({ where: { username } });
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

        isSuccess = true;
    } catch (error) {
        console.error("Signup Error:", error);
        return { error: "Internal server error. Please try again." };
    }

    if (isSuccess) {
        redirect("/get-started/sign-in?message=account_created")
    }
}

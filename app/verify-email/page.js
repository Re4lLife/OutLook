import prisma from "../_lib/prisma";
import { redirect } from "next/navigation";
import { redis } from "../_lib/Redis";


export default async function VerifyEmailPage({ searchParams }) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect("/get-started/sign-in?error=Invalid token");
  }

 
  const email = await redis.get(token);

  if (!email) {
    redirect("/get-started/sign-in?error=Link expired or invalid");
  }

  try {
    await prisma.user.update({
      where: { email: email },
      data: { emailVerified: new Date() },
    });

    await redis.del(token);

  } catch (error) {
    console.error("Verification Error:", error);
    redirect("/get-started/sign-in?error=Verification failed");
  }

  redirect("/get-started/sign-in?success=Email verified! You can now log in.");
}
import { redis } from "./Redis";
import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, token) => {
  // 1. Store token in Redis (Expires in 1 hour)
  // We map the token (key) to the email (value)
  await redis.set(token, email, { ex: 3600 });

  // 2. Setup Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  // 3. Send the Mail
  await transporter.sendMail({
    from: `"OutLook" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Confirm your email address",
    html: `
      <div style="background-color: #0b0e14; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 500px; margin: auto; background-color: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 40px; text-align: center; color: #ffffff;">
      
        <img src="https://i.postimg.cc/JnFk9prs/logo.png" 
           alt="OutLook Logo" 
           style="width: 60px; height: auto; margin-bottom: 24px;" 
        />

        <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600;">Welcome to OutLook!</h1>
      
        <p style="color: #8b949e; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
          Thanks for signing up! Please verify your email address to unlock your account. 
          This link will expire in 1 hour.
        </p>

        <div style="margin-bottom: 32px;">
           <a href="${confirmLink}" 
           style="background-color: #238636; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px;">
           Verify Email Address
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #30363d; margin: 32px 0;" />
      
      <p style="color: #484f58; font-size: 12px; margin: 0;">
        If you didn't create an account with OutLook, you can safely ignore this email.
      </p>
    </div>
  </div>
    `,
  });
};
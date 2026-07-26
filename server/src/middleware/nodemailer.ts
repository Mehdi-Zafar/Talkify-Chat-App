import nodemailer from "nodemailer";
import { env } from "../config/env";

// Create a reusable transporter
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

// Send an email function
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

import express, { Application, Request, Response } from "express";
import { Server } from "socket.io";
import { createServer } from "node:http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import authRoutes from "./routes/authRoutes";
import otpRoutes from "./routes/otpRoutes";
import errorHandler from "./middleware/errorHandler";
import cookieParser from "cookie-parser";

dotenv.config();

// Initialize Prisma Client
export const prisma = new PrismaClient();

const app: Application = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust origin as per your frontend domain
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend domain
    credentials: true, // Allow cookies
  })
);
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);

// Error handling middleware
app.use(errorHandler);

// Socket.IO Events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // const user = (socket as any).userDetails; // Retrieve authenticated user details
  // console.log(`Authenticated user: ${user.email}`);

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat room: ${chatId}`);
  });

  // socket.on("sendMessage", async (data) => {
  //   const { chatId, message } = data;

  //   // Save the message to the database using Prisma
  //   await prisma.messages.create({
  //     data: {
  //       content: message,
  //       sender_id: user.id,
  //       chat_id: chatId,
  //     },
  //   });

  //   io.to(chatId).emit("receiveMessage", message);
  // });

  // socket.on("disconnect", () => {
  //   console.log(`User disconnected: ${socket.id}`);
  // });
});

// Handle Prisma disconnect on server shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Prisma disconnected");
  process.exit(0);
});

// Start server
server.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  try {
    await prisma.$connect();
    console.log("Prisma connected to the database");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
});

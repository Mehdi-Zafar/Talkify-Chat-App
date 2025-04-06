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
import { createClient } from "@supabase/supabase-js";
import { Message, SocketEvent } from "./utils/models";

dotenv.config();

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Configure Supabase
export const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_API_KEY || ""
);

const app: Application = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["my-custom-header"],
  },
  allowEIO3: true,
});

const PORT = process.env.PORT || 3000;

// Enhanced CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Security headers middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
io.on(SocketEvent.CONNECT, (socket) => {
  console.log(`User connected: ${socket.id}`);

  // const user = (socket as any).userDetails; // Retrieve authenticated user details
  // console.log(`Authenticated user: ${user.email}`);

  socket.on(SocketEvent.JOIN_CHAT, (chatId) => {
    socket.join(chatId.toString());
    console.log(`User joined chat room: ${chatId}`);
  });

  socket.on(SocketEvent.SEND_MSG, async (data: Message) => {
    // Save the message to the database using Prisma
    await prisma.messages.create({
      data: {
        content: data.content,
        sender_id: data.sender.id,
        chat_id: data.chat_id,
      },
    });

    io.to(data.chat_id.toString()).emit(SocketEvent.RECEIVE_MSG, data);
  });

  socket.on(SocketEvent.DISCONNECT, () => {
    console.log(`User disconnected: ${socket.id}`);
  });
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

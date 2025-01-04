import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
export const prisma = new PrismaClient();
const app = express();
const server = createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     credentials: true,
//   },
// });

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// io.on("connection", (socket) => {
//   console.log("A user connected", socket.id);
//   // socket.emit("A user connected", socket.id);

//   socket.on("message", (data) => {
//     console.log(data);
//     // io.emit("receive", "For all users");
//     socket.broadcast.emit("receive", data);
//   });

//   // socket.on("receive", (data) => {
//   //   io.emit("For all users");
//   // });
// });

// socket.on("message", () => {
//   io.emit(msg);
// });

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

prisma.$connect();
console.info("Postgres: Connected");

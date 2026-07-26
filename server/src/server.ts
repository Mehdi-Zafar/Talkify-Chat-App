import { env } from "./config/env";
import { createServer } from "node:http";
import { Server } from "socket.io";
import app, { corsOptions } from "./app";
import prisma from "./lib/prisma";
import { registerSocketHandlers } from "./socket";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: corsOptions, // shared with Express — one source of truth
});

registerSocketHandlers(io);

// ─── Startup ──────────────────────────────────────────────────────────────────
const start = async () => {
  // Connect DB before the server accepts any connections.
  // If this throws, process.exit(1) fires before listen() is ever called.
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }

  httpServer.listen(env.PORT, () => {
    console.log(
      `🚀 Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`,
    );
  });
};

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  // Stop accepting new connections; wait for in-flight requests to finish.
  httpServer.close(async () => {
    await prisma.$disconnect();
    console.log("✅ Prisma disconnected");
    process.exit(0);
  });

  // Force exit if graceful shutdown takes more than 10 seconds.
  setTimeout(() => {
    console.error("⚠️  Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

start();

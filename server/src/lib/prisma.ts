import { PrismaClient } from "@prisma/client";
import { remember } from "@epic-web/remember";
import { isProd } from "../config/env";

// In production: create one instance, it lives for the process lifetime.
// In development: tsx watch restarts the module on every file change, which
// would create a new PrismaClient (and a new connection pool) each time while
// the old one is never disconnected — exhausting DB connections over a session.
// remember() stores the instance on globalThis so it survives module re-evaluation.
const createPrismaClient = () =>
  new PrismaClient({
    log: isProd() ? ["error"] : ["query", "warn", "error"],
  });

const prisma = isProd()
  ? createPrismaClient()
  : remember("prisma", createPrismaClient);

export default prisma;

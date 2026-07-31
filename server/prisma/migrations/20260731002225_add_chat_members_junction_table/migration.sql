/*
  Warnings:

  - You are about to drop the column `members` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `verification_code` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `verification_code_expiry` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chats" DROP COLUMN "members";

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "content" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "verification_code",
DROP COLUMN "verification_code_expiry";

-- CreateTable
CREATE TABLE "chat_members" (
    "chat_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_members_pkey" PRIMARY KEY ("chat_id","user_id")
);

-- CreateIndex
CREATE INDEX "chat_members_user_id_idx" ON "chat_members"("user_id");

-- CreateIndex
CREATE INDEX "chats_updatedAt_idx" ON "chats"("updatedAt" DESC);

-- CreateIndex
CREATE INDEX "messages_chat_id_createdAt_idx" ON "messages"("chat_id", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- AddForeignKey
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

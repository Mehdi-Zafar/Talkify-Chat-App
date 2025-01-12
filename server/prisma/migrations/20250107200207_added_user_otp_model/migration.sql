/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `userOtp` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "attachments" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- CreateIndex
CREATE UNIQUE INDEX "userOtp_email_key" ON "userOtp"("email");

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "attachments" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- CreateTable
CREATE TABLE "userOtp" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "otp" VARCHAR(50) NOT NULL DEFAULT '',
    "otp_expiry" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "userOtp_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "attachments" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "user_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(50) NOT NULL,
    "gender" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "verification_code" VARCHAR(50) NOT NULL DEFAULT '',
    "verification_code_expiry" INTEGER NOT NULL DEFAULT 0,
    "image" VARCHAR(255) NOT NULL DEFAULT '',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

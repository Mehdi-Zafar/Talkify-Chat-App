import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Password@123", 10);
  // Seed users
  const user1 = await prisma.users.create({
    data: {
      user_name: "JohnDoe",
      email: "john.doe@example.com",
      phone_number: "1234567890",
      gender: "Male",
      password: hashedPassword, // Replace with hashed password
    },
  });

  const user2 = await prisma.users.create({
    data: {
      user_name: "JaneDoe",
      email: "jane.doe@example.com",
      phone_number: "0987654321",
      gender: "Female",
      password: hashedPassword, // Replace with hashed password
    },
  });

  const user3 = await prisma.users.create({
    data: {
      user_name: "AliceSmith",
      email: "alice.smith@example.com",
      phone_number: "1112223333",
      gender: "Female",
      password: hashedPassword, // Replace with hashed password
    },
  });

  const user4 = await prisma.users.create({
    data: {
      user_name: "BobBrown",
      email: "bob.brown@example.com",
      phone_number: "4445556666",
      gender: "Male",
      password: hashedPassword, // Replace with hashed password
    },
  });

  // Seed chats
  const generalChat = await prisma.chats.create({
    data: {
      name: "General Chat",
      members: [user1.id, user2.id],
      creator_id: user1.id,
      isGroupChat: true,
    },
  });

  const privateChat = await prisma.chats.create({
    data: {
      name: "Private Chat",
      members: [user3.id, user4.id],
      creator_id: user3.id,
      isGroupChat: false,
    },
  });

  // Seed messages
  await prisma.messages.createMany({
    data: [
      {
        content: "Hello, everyone!",
        attachments: [],
        sender_id: user1.id,
        chat_id: generalChat.id,
      },
      {
        content: "Hi, John!",
        attachments: [],
        sender_id: user2.id,
        chat_id: generalChat.id,
      },
      {
        content: "How are you, Alice?",
        attachments: [],
        sender_id: user4.id,
        chat_id: privateChat.id,
      },
      {
        content: "I am good, Bob. Thanks for asking!",
        attachments: [],
        sender_id: user3.id,
        chat_id: privateChat.id,
      },
    ],
  });

  console.log("Seeding complete with additional data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

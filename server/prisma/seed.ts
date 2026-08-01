import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hashPassword("Password@123");

  // Seed users
  const user1 = await prisma.users.create({
    data: {
      user_name: "JohnDoe",
      email: "john.doe@sharklasers.com",
      phone_number: "1234567890",
      gender: "Male",
      password: hashedPassword,
    },
  });

  const user2 = await prisma.users.create({
    data: {
      user_name: "JaneDoe",
      email: "jane.doe@sharklasers.com",
      phone_number: "0987654321",
      gender: "Female",
      password: hashedPassword,
    },
  });

  const user3 = await prisma.users.create({
    data: {
      user_name: "AliceSmith",
      email: "alice.smith@sharklasers.com",
      phone_number: "1112223333",
      gender: "Female",
      password: hashedPassword,
    },
  });

  const user4 = await prisma.users.create({
    data: {
      user_name: "BobBrown",
      email: "bob.brown@sharklasers.com",
      phone_number: "4445556666",
      gender: "Male",
      password: hashedPassword,
    },
  });

  // Seed chats — members now use nested create into chat_members junction table
  const generalChat = await prisma.chats.create({
    data: {
      name: "General Chat",
      creator_id: user1.id,
      isGroupChat: true,
      members: {
        create: [{ user_id: user1.id }, { user_id: user2.id }],
      },
    },
  });

  const privateChat = await prisma.chats.create({
    data: {
      name: "Private Chat",
      creator_id: user3.id,
      isGroupChat: false,
      members: {
        create: [{ user_id: user3.id }, { user_id: user4.id }],
      },
    },
  });

  // Seed messages — no changes needed here
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

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

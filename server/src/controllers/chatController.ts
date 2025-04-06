import { Request, Response, NextFunction } from "express";
import { prisma } from "..";
import { Prisma } from "@prisma/client";

export const createChat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log(req.body);
    const chat = await prisma.chats.create({ data: req.body });
    res.status(201).json(chat);
  } catch (err) {
    next(err);
  }
};

export const getChats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const chats = await prisma.chats.findMany();
    res.status(200).json(chats);
  } catch (err) {
    next(err);
  }
};

export const getChatById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const chatId = parseInt(req.params.id, 10);
    if (isNaN(chatId)) {
      res.status(400).json({ message: "Invalid chat ID" });
      return;
    }

    // Get chat with messages and member details in a single query
    const chat = await prisma.chats.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { id: "desc" }, // Get newest messages first
          take: 50, // Limit to 50 most recent messages
          include: {
            user: {
              select: {
                id: true,
                user_name: true,
                email: true,
                phone_number: true,
                gender: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    // Get additional member details (excluding members already included in messages)
    const memberIds = chat.members.filter(
      (id) => !chat.messages.some((msg) => msg.sender_id === id)
    );

    const additionalMembers = await prisma.users.findMany({
      select: {
        id: true,
        user_name: true,
        email: true,
        phone_number: true,
        gender: true,
        image: true,
      },
      where: {
        id: {
          in: memberIds,
        },
      },
    });

    // Combine all members (from messages and additional query)
    const allMembers = [
      ...chat.messages.map((msg) => msg.user),
      ...additionalMembers,
    ].reduce((unique, member) => {
      if (!unique.some((u) => u.id === member.id)) {
        unique.push(member);
      }
      return unique;
    }, [] as typeof additionalMembers);

    // Transform response to better structure
    const response = {
      id: chat.id,
      name: chat.name,
      isGroupChat: chat.isGroupChat,
      creatorId: chat.creator_id,
      members: allMembers,
      messages: chat.messages.map((message) => ({
        id: message.id,
        content: message.content,
        attachments: message.attachments,
        sender: {
          id: message.user.id,
          name: message.user.user_name,
          image: message.user.image,
        },
        // sentAt: message.createdAt // Assuming you have createdAt field
      })),
    };

    res.status(200).json(response);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        // Record not found
        res.status(404).json({ message: "Chat not found" });
        return;
      }
    }
    next(err);
  }
};

export const getChatByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ message: "Invalid user ID format" });
      return;
    }

    // 1. Fetch the chats the user is a member of
    const chats = await prisma.chats.findMany({
      where: { members: { has: userId } },
      // Optionally add orderBy here if needed, e.g., for last message timestamp
      // orderBy: { lastMessageTimestamp: 'desc' },
    });

    // Correct check for empty results from findMany
    if (chats.length === 0) {
      // It's often better to return an empty array than a 404
      // unless specifically required otherwise. A user having no chats isn't strictly an error.
      res.status(200).json({
        message: "No chats found for this user.",
        data: [], // Return empty array
      });
      return;
    }

    // 2. Collect all unique member IDs from all fetched chats
    const memberIdSet = new Set<number>();
    chats.forEach((chat) => {
      chat.members.forEach((memberId) => {
        memberIdSet.add(memberId);
      });
    });
    const uniqueMemberIds = Array.from(memberIdSet);

    // 3. Fetch the details for all unique members
    let membersMap = new Map<number, any>();

    if (uniqueMemberIds.length > 0) {
      const memberDetailsList = await prisma.users.findMany({
        // Assuming your User model is named 'users'
        where: {
          id: {
            in: uniqueMemberIds,
          },
        },
        select: {
          // IMPORTANT: Select only the fields you NEED on the frontend
          id: true,
          user_name: true, // Adjust field names based on your schema
          image: true, // Adjust field names based on your schema
          // Add other needed fields like 'email', 'onlineStatus' if required
        },
      });

      // 4. Create a Map for easy lookup (ID -> MemberDetail)
      memberDetailsList.forEach((member) => {
        membersMap.set(member.id, member);
      });
    }

    // 5. Augment the chat data with member details
    const chatsWithMemberDetails = chats.map((chat) => {
      // Map member IDs to actual member detail objects
      const populatedMembers = chat.members
        .map((memberId) => membersMap.get(memberId))
        // Filter out undefined results in case a user ID exists in chat.members
        // but the corresponding user wasn't found (data integrity issue)
        .filter((member): member is any => member !== undefined);

      // Determine chat name for individual chats if not set
      let finalChatName = chat.name;
      if (!chat.isGroupChat && !finalChatName) {
        const otherMember = populatedMembers.find((m) => m.id !== userId);
        finalChatName = otherMember ? otherMember.name : "Chat"; // Use other member's name
      }

      // Return the original chat data plus the populated members array
      // and the potentially derived name
      return {
        ...chat,
        name: finalChatName, // Overwrite name if derived for individual chat
        memberDetails: populatedMembers, // Add the new field with details
        // Optionally remove the original 'members' ID array if you don't need it on the front-end
        // members: undefined, // Example of removing original IDs array
      };
    });

    res.status(200).json({
      message: "User Chats fetched succesfully!",
      data: chatsWithMemberDetails,
    });
  } catch (err) {
    next(err);
  }
};

export const updateChat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const chat = await prisma.chats.update({
      where: { id: parseInt(req.params.id, 10) },
      data: req.body,
    });
    res.status(200).json(chat);
  } catch (err) {
    next(err);
  }
};

export const deleteChat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await prisma.chats.delete({ where: { id: parseInt(req.params.id, 10) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

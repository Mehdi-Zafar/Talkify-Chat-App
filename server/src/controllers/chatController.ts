import { Request, Response, NextFunction } from "express";
import { prisma } from "..";

export const createChat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
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
    const chat = await prisma.chats.findUnique({
      where: { id: parseInt(req.params.id, 10) },
    });
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }
    res.status(200).json(chat);
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

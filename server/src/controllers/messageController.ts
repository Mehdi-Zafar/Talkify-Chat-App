import { Request, Response, NextFunction } from "express";
import { prisma } from "..";

export const createMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const message = await prisma.messages.create({ data: req.body });
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const messages = await prisma.messages.findMany({
      include: { user: true, chat: true },
    });
    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
};

export const getMessageById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const message = await prisma.messages.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: { user: true, chat: true },
    });
    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }
    res.status(200).json(message);
  } catch (err) {
    next(err);
  }
};

export const updateMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const message = await prisma.messages.update({
      where: { id: parseInt(req.params.id, 10) },
      data: req.body,
    });
    res.status(200).json(message);
  } catch (err) {
    next(err);
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await prisma.messages.delete({
      where: { id: parseInt(req.params.id, 10) },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

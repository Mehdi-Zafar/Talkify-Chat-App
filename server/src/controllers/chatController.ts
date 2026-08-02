import { Request, Response, NextFunction } from "express";
import * as ChatService from "../services/chatService";
import {
  CreateChatBody,
  UpdateChatBody,
  IdParam,
  PaginationQuery,
} from "../types/requests";
import { parseId, parsePagination } from "../lib/utils";

export const createChat = async (
  req: Request<{}, {}, CreateChatBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const chat = await ChatService.createChat(req.body, req.user!.id);
    res.status(201).json(chat);
  } catch (err) {
    next(err);
  }
};

export const getChats = async (
  req: Request<{}, {}, {}, PaginationQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit } = parsePagination(req.query.page, req.query.limit);
    const result = await ChatService.getChats(req.user!.id, page, limit);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getChatById = async (
  req: Request<IdParam>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const chatId = parseId(req.params.id);
    const chat = await ChatService.getChatById(chatId, req.user!.id);
    res.status(200).json(chat);
  } catch (err) {
    next(err);
  }
};

export const getChatByUserId = async (
  req: Request<IdParam>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = parseId(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const chats = await ChatService.getChatsByUserId(
      userId,
      req.user!.id,
      page,
      limit,
    );
    res.status(200).json(chats);
  } catch (err) {
    next(err);
  }
};

export const getChatMessages = async (
  req: Request<IdParam>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const chatId = parseId(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 30;
    const result = await ChatService.getChatMessages(
      chatId,
      req.user!.id,
      page,
      limit,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateChat = async (
  req: Request<IdParam, {}, UpdateChatBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const chatId = parseId(req.params.id);
    const chat = await ChatService.updateChat(chatId, req.user!.id, req.body);
    res.status(200).json(chat);
  } catch (err) {
    next(err);
  }
};

export const deleteChat = async (
  req: Request<IdParam>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const chatId = parseId(req.params.id);
    await ChatService.deleteChat(chatId, req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getChatMeta = async (
  req: Request<IdParam>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const chatId = parseId(req.params.id);
    const chat = await ChatService.getChatMeta(chatId, req.user!.id);
    res.status(200).json(chat);
  } catch (err) {
    next(err);
  }
};

export const markChatAsRead = async (
  req: Request<IdParam>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const chatId = parseId(req.params.id);
    await ChatService.markAsRead(chatId, req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

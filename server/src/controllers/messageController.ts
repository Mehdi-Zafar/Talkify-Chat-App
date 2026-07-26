import { Request, Response, NextFunction } from "express";
import * as MessageService from "../services/messageService";
import {
  CreateMessageBody,
  UpdateMessageBody,
  IdParam,
  PaginationQuery,
} from "../types/requests";
import { parseId, parsePagination } from "../lib/utils";

export const createMessage = async (
  req: Request<{}, {}, CreateMessageBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const message = await MessageService.createMessage(req.body, req.user!.id);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (
  req: Request<{ chatId: string }, {}, {}, PaginationQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const chatId = parseId(req.params.chatId);
    const { page, limit } = parsePagination(req.query.page, req.query.limit);
    const result = await MessageService.getMessages(
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

export const getMessageById = async (
  req: Request<IdParam>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const message = await MessageService.getMessageById(id, req.user!.id);
    res.status(200).json(message);
  } catch (err) {
    next(err);
  }
};

export const updateMessage = async (
  req: Request<IdParam, {}, UpdateMessageBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const message = await MessageService.updateMessage(
      id,
      req.user!.id,
      req.body.content,
    );
    res.status(200).json(message);
  } catch (err) {
    next(err);
  }
};

export const deleteMessage = async (
  req: Request<IdParam>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    await MessageService.deleteMessage(id, req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

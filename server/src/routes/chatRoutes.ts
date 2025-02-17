import { Router } from "express";
import {
  createChat,
  getChats,
  getChatById,
  updateChat,
  deleteChat,
  getChatByUserId,
} from "../controllers/chatController";

const router = Router();

router.post("/", createChat);
router.get("/", getChats);
router.get("/:id", getChatById);
router.get("/user/:id", getChatByUserId);
router.put("/:id", updateChat);
router.delete("/:id", deleteChat);

export default router;

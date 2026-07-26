import { Router } from "express";
import {
  createChat,
  getChats,
  getChatById,
  getChatByUserId,
  updateChat,
  deleteChat,
} from "../controllers/chatController";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate";
import {
  idParamSchema,
  paginationSchema,
  createChatSchema,
  updateChatSchema,
} from "../validators/chatValidators";
import authenticateUser from "../middleware/authenticateUser";

const router = Router();

router.use(authenticateUser);

router.post("/", validateBody(createChatSchema), createChat);
router.get("/", validateQuery(paginationSchema), getChats);
router.get("/user/:id", validateParams(idParamSchema), getChatByUserId);
router.get("/:id", validateParams(idParamSchema), getChatById);
router.put(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateChatSchema),
  updateChat,
);
router.delete("/:id", validateParams(idParamSchema), deleteChat);

export default router;

import { Router } from "express";
import {
  createMessage,
  getMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
} from "../controllers/messageController";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate";
import {
  createMessageSchema,
  updateMessageSchema,
  chatIdParamSchema,
  paginationSchema,
} from "../validators/messageValidators";
import { idParamSchema } from "../validators/userValidators";
import authenticateUser from "../middleware/authenticateUser";

const router = Router();

router.use(authenticateUser);

router.post("/", validateBody(createMessageSchema), createMessage);
router.get(
  "/:chatId",
  validateParams(chatIdParamSchema),
  validateQuery(paginationSchema),
  getMessages,
);
router.get("/message/:id", validateParams(idParamSchema), getMessageById);
router.put(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateMessageSchema),
  updateMessage,
);
router.delete("/:id", validateParams(idParamSchema), deleteMessage);

export default router;

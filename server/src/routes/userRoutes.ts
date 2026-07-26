import { Router } from "express";
import {
  getUserProfile,
  updateUserByEmail,
  updateUserData,
  updateUserAvatar,
  getChatUsers,
  deleteUser,
} from "../controllers/userController";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate";
import {
  idParamSchema,
  updateUserDataSchema,
  updateUserByEmailSchema,
  chatUsersQuerySchema,
} from "../validators/userValidators";
import { upload } from "../middleware/multer";
import authenticateUser from "../middleware/authenticateUser";

const router = Router();

router.use(authenticateUser);

router.get("/profile", getUserProfile);
router.get(
  "/chat/:id",
  validateParams(idParamSchema),
  validateQuery(chatUsersQuerySchema),
  getChatUsers,
);
// router.put("/", validateBody(updateUserByEmailSchema), updateUserByEmail);
router.put(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateUserDataSchema),
  updateUserData,
);
// router.post(
//   "/upload-user-data/:id",
//   validateParams(idParamSchema),
//   validateBody(updateUserDataSchema),
//   updateUserData,
// );
router.post(
  "/avatar/:id",
  validateParams(idParamSchema),
  upload.single("image"),
  updateUserAvatar,
);
router.delete("/:id", validateParams(idParamSchema), deleteUser);

export default router;

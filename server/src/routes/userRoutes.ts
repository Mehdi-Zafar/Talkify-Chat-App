import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUserById,
  deleteUser,
  getUserProfile,
  updateUserData,
  updateUserByEmail,
  resetUserPassword,
  getChatUsers,
} from "../controllers/userController";
import { upload } from "../middleware/multer";

const router = Router();

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/", updateUserByEmail);
router.put("/:id", updateUserById);
router.delete("/:id", deleteUser);
router.get("/get/profile", getUserProfile);
router.post("/reset-password", resetUserPassword);
router.get("/chat/:id", getChatUsers);
router.post(
  "/upload-user-data/:id",
  upload.single("image"), // Middleware for handling single file upload
  updateUserData
);

export default router;

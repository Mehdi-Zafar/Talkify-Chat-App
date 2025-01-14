import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserData,
} from "../controllers/userController";
import { upload } from "../middleware/multer";

const router = Router();

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/get/profile", getUserProfile);
router.post(
  "/upload-user-data",
  upload.single("image"), // Middleware for handling single file upload
  updateUserData
);

export default router;

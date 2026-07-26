import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  resetUserPassword,
} from "../controllers/authController";
import { validateBody } from "../middleware/validate";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validators/authValidators";

const router = Router();

router.post("/login", validateBody(loginSchema), loginUser);
router.post("/register", validateBody(registerSchema), registerUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshAccessToken);
router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  resetUserPassword,
);

export default router;

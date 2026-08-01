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
import { authLimiter, refreshLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/login", authLimiter, validateBody(loginSchema), loginUser);
router.post(
  "/register",
  authLimiter,
  validateBody(registerSchema),
  registerUser,
);
router.post("/logout", authLimiter, logoutUser);
router.post("/refresh", refreshLimiter, refreshAccessToken);
router.post(
  "/reset-password",
  authLimiter,
  validateBody(resetPasswordSchema),
  resetUserPassword,
);

export default router;

import { Router } from "express";
import { sendOtp, verifyOtp } from "../controllers/otpController";
import { validateBody } from "../middleware/validate";
import { sendOtpSchema, verifyOtpSchema } from "../validators/otpValidators";

const router = Router();

router.post("/send", validateBody(sendOtpSchema), sendOtp);
router.post("/verify", validateBody(verifyOtpSchema), verifyOtp);

export default router;

import { Router } from "express";
import { sendOtp, verifyOtp } from "../controllers/otpController";

const router = Router();

// Route to send OTP
router.post("/send", sendOtp);

// Route to verify OTP
router.post("/verify", verifyOtp);

export default router;

import { httpClient } from "../httpClient";
import {
  OtpRequest,
  OtpVerifyRequest,
  OtpResponse,
} from "../../utils/contracts";

// Send OTP API
export const sendOtp = async (otpRequest: OtpRequest): Promise<OtpResponse> => {
  try {
    const res = await httpClient.post<OtpResponse>("/otp/send", otpRequest);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Verify OTP API
export const verifyOtp = async (
  otpVerifyRequest: OtpVerifyRequest
): Promise<OtpResponse> => {
  try {
    const res = await httpClient.post<OtpResponse>(
      "/otp/verify",
      otpVerifyRequest
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

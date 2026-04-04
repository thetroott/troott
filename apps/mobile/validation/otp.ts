import { z } from "zod";

export const OTPSchema = z.object({
    otp:z.string().length(6, {
        message: "OTP must be 6 digits",
    }).regex(/^\d+$/, "OTP must be a number"),
})

export type OTPType = z.infer<typeof OTPSchema>;
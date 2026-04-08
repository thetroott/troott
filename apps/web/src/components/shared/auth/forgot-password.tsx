"use client";

import type React from "react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";
import type { IAPIResponse, IForgotPwdFormErrors, IForm } from "@/utils/interfaces.util";
import { useMutation } from "@tanstack/react-query";
import type { ForgotPasswordDTO, ResendOtpDTO, VerifyOtpDTO } from "@/dtos/auth.dto";
import apiCall from "@/api/config";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { OtpType } from "@/utils/enums.util";
import { handleMutationError } from "@/utils/helpers.util";


function ForgotPasswordForm(data: IForm) {
  
  const { className,onStepChange, ...props } = data;
  const navigate = useNavigate()

  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [formData, setFormData] = useState({
    email: "",
    otp: (Array(6).fill(""))
  });
  const [errors, setErrors] = useState<IForgotPwdFormErrors>({});
  const [touched, setTouched] = useState({
    email: false,
    otp: false,
  });
  const [resendCountdown, setResendCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateStep = (newStep: "email" | "otp" | "success") => {
    setStep(newStep);
    onStepChange?.(newStep);
  };


  // validation
  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const validateOTP = (otp: string[]): string | undefined => {
    const otpString = otp.join("");
    if (!otpString) return "OTP is required";
    if (otpString.length !== 6) return "Please enter all 6 digits";
    if (!/^\d+$/.test(otpString)) return "OTP must contain only numbers";
    return undefined;
  };

  const maskEmail = (email: string): string => {
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 2) return email;
    const maskedLocal =
      localPart[0] +
      "*".repeat(localPart.length - 2) +
      localPart[localPart.length - 1];
    return `${maskedLocal}@${domain}`;
  };

  const startResendCountdown = () => {
    setResendCountdown(60);
    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // payload helper
     const buildOtpPayload = (): VerifyOtpDTO => ( {
      email: formData.email as string,
      otp: Number(formData.otp.join("")), 
      otpType: OtpType.FORGOTPASSWORD, 
    })
  

  // mutations

  const sendOtpMutation = useMutation({
    mutationFn: async (payload: ForgotPasswordDTO) => {
      return apiCall.auth.forgotPassword(payload)
    },
    onSuccess: (data: IAPIResponse) => {
      toast.success(data.message);

      updateStep("otp");
      startResendCountdown();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    },
    onError: handleMutationError
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (payload: VerifyOtpDTO) => {
      return apiCall.auth.verifyOTP(payload);
    },
    onSuccess: (data: IAPIResponse) => {
      toast.success(data.message);
      updateStep("success")
    },
    onError: handleMutationError
  });

  const resendOtpMutation = useMutation({
    mutationFn: async (payload: ResendOtpDTO) => {
      return apiCall.auth.resendOTP(payload)
    },
    onSuccess: () => {
      setFormData((prev) => ({ ...prev, otp: Array(6).fill("") }));
      setErrors({});
      setTouched((prev) => ({ ...prev, otp: false }));
      startResendCountdown();
      otpRefs.current[0]?.focus();
    },
    onError: handleMutationError
  });




  // handlers
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, email: value }));

    // Clear error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;

    const otp = [...formData.otp];
    otp[index] = value;
    setFormData((prev) => ({ ...prev, otp: otp }));

    // Clear error when user starts typing
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: undefined }));
    }

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

 // Auto-submit if last digit
    if (index === 5 && otp.every((d) => d !== "")) {
      const otpError = validateOTP(otp);
      if (!otpError) verifyOtpMutation.mutate({
        email: formData.email,
        otp: Number(otp.join("")),
        otpType: OtpType.FORGOTPASSWORD,
      });
      else setErrors({ otp: otpError });
    }
  };

  const handleOTPKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setFormData((prev) => ({ ...prev, otp: newOtp }));

      // Focus the last input and auto-submit
      otpRefs.current[5]?.focus();
      setTimeout(() => handleVerifyOTP(new Event("submit") as any), 100);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched((prev) => ({ ...prev, email: true }));

    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setErrors({});
    await sendOtpMutation.mutate({email: formData.email});
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched((prev) => ({ ...prev, otp: true }));

    const otpError = validateOTP(formData.otp);
    if (otpError) {
      setErrors({ otp: otpError });
      return;
    }

    setErrors({});
    verifyOtpMutation.mutate(buildOtpPayload());
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;

    resendOtpMutation.mutate(buildOtpPayload())
  };

  const handleBackToEmail = () => {
    setStep("email");
    updateStep("email");
    setFormData((prev) => ({ ...prev, otp: Array(6).fill("") }));
    setErrors({});
    setTouched({ email: false, otp: false });
  };

  // Email step
  if (step === "email") {
    return (
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={handleSendOTP}
        {...props}
      >
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
            
              id="email"
              type="email"
              placeholder="m@example.com"
              value={formData.email}
              onChange={handleEmailChange}
              className={cn(
                "pl-10",
                "h-12",
                errors.email &&
                  touched.email &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={errors.email && touched.email ? "true" : "false"}
              aria-describedby={
                errors.email && touched.email ? "email-error" : undefined
              }
            />
          </div>
          {errors.email && touched.email && (
            <p
              id="email-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.email}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full h-12" 
         disabled={sendOtpMutation.isPending}
        >
          {sendOtpMutation.isPending ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              Sending...
            </>
          ) : (
            "Request OTP"
          )}
        </Button>

        <div className="text-center text-sm">
          Remember your password?{" "}
          <a href="/login" className="underline underline-offset-4">
            Back to login
          </a>
        </div>
      </form>
    );
  }

  // OTP verification step
  if (step === "otp") {
    return (
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={handleVerifyOTP}
        {...props}
      >
        <div className="grid gap-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>We sent a verification code to</p>
            <p className="font-medium text-foreground">
              {maskEmail(formData.email)}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="otp-0">Verification Code</Label>
            <div className="flex gap-2 justify-center">
              {formData.otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  onPaste={index === 0 ? handleOTPPaste : undefined}
                  className={cn(
                    "w-12 h-12 text-center text-lg font-semibold",
                    errors.otp &&
                      touched.otp &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                  aria-invalid={errors.otp && touched.otp ? "true" : "false"}
                  aria-describedby={
                    errors.otp && touched.otp ? "otp-error" : undefined
                  }
                />
              ))}
            </div>
            {errors.otp && touched.otp && (
              <p
                id="otp-error"
                className="text-sm text-destructive text-center"
                role="alert"
              >
                {errors.otp}
              </p>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Didn't receive the code?{" "}
              {resendCountdown > 0 ? (
                <span>Resend in {resendCountdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendOtpMutation.isPending}
                  className="text-primary underline underline-offset-4 hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend code
                </button>
              )}
            </p>
          </div>

          <Button type="submit" className="w-full" 
          disabled={verifyOtpMutation.isPending}
        >
          {verifyOtpMutation.isPending ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              Verifying..
            </>
          ) : (
            "Verify code"
          )}
      
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleBackToEmail}
            disabled={verifyOtpMutation.isPending || sendOtpMutation.isPending}
        >
          {verifyOtpMutation.isPending || sendOtpMutation.isPending && (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
            </>
          )}
    
            Back to email
          </Button>
        </div>
      </form>
    );
  }

  // Success step
  return (
    <div className={cn("flex flex-col gap-6 text-center", className)}>
      <div className="flex flex-col gap-2">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">Email verified!</h2>
        <p className="text-sm text-muted-foreground">
          Your identity has been verified. You can now create a new password.
        </p>
      </div>

      <Button
        onClick={() => navigate("/reset-password")}
        className="w-full"
      >
        Create new password
      </Button>

      <Button
        onClick={() =>  navigate("/login")}
        variant="outline"
        className="w-full"
      >
        Back to login
      </Button>
    </div>
  );
}

export default ForgotPasswordForm;

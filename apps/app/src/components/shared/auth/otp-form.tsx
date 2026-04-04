import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  IAPIResponse,
  IForm,
  IOtpFormErrors,
} from "@/utils/interfaces.util";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import type { VerifyOtpDTO } from "@/dtos/auth.dto";
import apiCall from "@/api/config";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { OtpType } from "@/utils/enums.util";
import { handleMutationError } from "@/utils/helpers.util";
import storage from "@/utils/storage.util";



const OtpForm = (data: IForm) => {

  const { className, email, onSuccess, onResend, ...props } = data;

  const navigate = useNavigate();

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [errors, setErrors] = useState<IOtpFormErrors>({});
  const [touched, setTouched] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otpMutation = useMutation({
    mutationFn: (payload: VerifyOtpDTO) => {
      return apiCall.auth.verifyOTP(payload);
    },
    onSuccess: (data: IAPIResponse) => {
      toast.success(data.message);
      navigate("/login");
      onSuccess?.();
    },
    onError: handleMutationError
  });

  const validateOTP = (otp: string[]): string | undefined => {
    const otpString = otp.join("");
    if (!otpString) return "OTP is required";
    if (otpString.length !== 6) return "Please enter all 6 digits";
    if (!/^\d+$/.test(otpString)) return "OTP must contain only numbers";
  };

  const maskEmail = (email: string): string => {
    if (!email) return "";
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

   
  const userEmail = storage.getUserEmail() as string;
  const buildOtpPayload = (): VerifyOtpDTO => {
   // Clean email by removing extra quotes if present and parsing JSON if needed
   let cleanEmail = userEmail || '';
   
   // If the email is JSON stringified, parse it
   if (cleanEmail.startsWith('"') && cleanEmail.endsWith('"')) {
     try {
       cleanEmail = JSON.parse(cleanEmail);
     } catch (e) {
       // If parsing fails, just remove the quotes
       cleanEmail = cleanEmail.replace(/^"(.*)"$/, '$1');
     }
   }

   return {
     email: cleanEmail,
     otp: Number(otp.join("")), 
     otpType: OtpType.REGISTER, 
   };
 }


  const handleOTPChange = (index: number, value: string) => {
    
      // Remove non-digit characters immediately
  const numericValue = value.replace(/\D/g, "");
  if (!numericValue) {
    // Clear this field if nothing valid
    const newOtp = [...otp];
    newOtp[index] = "";
    setOtp(newOtp);
    return;
  }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    const otpError = validateOTP(newOtp);
  if (otpError) {
    setErrors({ otp: otpError });
  } else {
    setErrors({});
  }

  setTouched(true);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  

 const handleOTPPaste = (e: React.ClipboardEvent) => {
  e.preventDefault();

  const pasted = e.clipboardData
    .getData("text")
    .replace(/\D/g, "")
    .slice(0, 6);

  if (!pasted) return;

  const newOtp = pasted.split("");
  setOtp(newOtp);

  // Focus last input
  otpRefs.current[newOtp.length - 1]?.focus();

  // Auto-submit if all 6 digits present
  if (newOtp.length === 6) {
    setTouched(true);

    const otpError = validateOTP(newOtp);
    if (!otpError) {
      setErrors({});
      otpMutation.mutate(buildOtpPayload());
    } else {
      setErrors({ otp: otpError });
    }
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched(true);

    const otpError = validateOTP(otp);
    if (otpError) {
      setErrors({ otp: otpError });
      return;
    }

    setErrors({});

    await otpMutation.mutate(buildOtpPayload());
  };

    const handleResendOTP = async () => {
    setOtp(Array(6).fill(""));
    setErrors({});
    setTouched(false);
    startResendCountdown();
    otpRefs.current[0]?.focus();
    onResend?.();
  };


  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="grid gap-6">
        {email && (
          <div className="text-center text-sm text-muted-foreground">
            <p>We sent a verification code to</p>
            <p className="font-medium text-foreground">{maskEmail(email)}</p>
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="otp-0">Verification Code</Label>
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                ref={(el) => {
                  otpRefs.current[index] = el;
                  return undefined;
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
                    touched &&
                    "border-destructive focus-visible:ring-destructive"
                )}
                aria-invalid={errors.otp && touched ? "true" : "false"}
                aria-describedby={
                  errors.otp && touched ? "otp-error" : undefined
                }
              />
            ))}
          </div>
          {errors.otp && touched && (
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
                disabled={otpMutation.isPending}
                className="text-primary underline underline-offset-4 hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend code
              </button>
            )}
          </p>
        </div>

        <Button
          type="submit"
          className="w-full h-12 "
          disabled={otpMutation.isPending}
        >
          {otpMutation.isPending ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              Verifying...
            </>
          ) : (
            "Verify code"
          )}
        </Button>
      </div>
    </form>
  );
};

export default OtpForm;

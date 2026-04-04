"use client"

import type React from "react"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FormErrors {
  otp?: string
}

export function OTPForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState(false)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const validateOTP = (otp: string[]): string | undefined => {
    const otpString = otp.join("")
    if (!otpString) return "OTP is required"
    if (otpString.length !== 6) return "Please enter all 6 digits"
    if (!/^\d+$/.test(otpString)) return "OTP must contain only numbers"
    return undefined
  }

  const validateForm = (): boolean => {
    const otpError = validateOTP(otp)
    if (otpError) {
      setErrors({ otp: otpError })
      return false
    }
    setErrors({})
    return true
  }

  const handleOTPChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Clear error when user starts typing
    if (errors.otp) {
      setErrors({})
    }

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)

    if (pastedData.length === 6) {
      const newOtp = pastedData.split("")
      setOtp(newOtp)

      // Focus the last input
      otpRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setTouched(true)

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate API call to verify OTP
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log("Verifying OTP:", otp.join(""))

      // Handle successful verification here
      alert("OTP verified successfully!")
    } catch (error) {
      console.error("OTP verification failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOTP = async () => {
    setIsSubmitting(true)

    try {
      // Simulate API call to resend OTP
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Resending OTP")

      // Clear current OTP
      setOtp(["", "", "", "", "", ""])
      setErrors({})
      setTouched(false)
      otpRefs.current[0]?.focus()
    } catch (error) {
      console.error("Failed to resend OTP:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Enter verification code</h1>
        <p className="text-balance text-sm text-muted-foreground">We sent a 6-digit code to your email address</p>
      </div>
      <div className="grid gap-6">
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
                  errors.otp && touched && "border-destructive focus-visible:ring-destructive",
                )}
                aria-invalid={errors.otp && touched ? "true" : "false"}
                aria-describedby={errors.otp && touched ? "otp-error" : undefined}
              />
            ))}
          </div>
          {errors.otp && touched && (
            <p id="otp-error" className="text-sm text-destructive text-center" role="alert">
              {errors.otp}
            </p>
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isSubmitting}
              className="text-primary underline underline-offset-4 hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend code
            </button>
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Verify code"}
        </Button>
      </div>
    </form>
  )
}

import ForgotPasswordForm from "@/components/shared/auth/forgot-password";
import { AuthLayout } from "@/components/layouts/Authlayout";
import { useState } from "react";

const ForgotPassword = () => {
  const [currentStep, setCurrentStep] = useState<"email" | "otp" | "success">(
    "email"
  );

  const getStepContent = () => {
    switch (currentStep) {
      case "email":
        return {
          title: "Forgot your password?",
          description:
            "Enter your email address and we'll send you a verification code",
        };
      case "otp":
        return {
          title: "Enter verification code",
          description: "Check your email for the 6-digit verification code",
        };
      case "success":
        return {
          title: "",
          description: "",
        };
      default:
        return {
          title: "Forgot your password?",
          description:
            "Enter your email address and we'll send you a verification code",
        };
    }
  };

  const stepContent = getStepContent();

  return (
    <>
       <AuthLayout
      title={stepContent.title}
      description={stepContent.description}
      hideHeaderOnSuccess={currentStep === "success"}
    >
      <ForgotPasswordForm onStepChange={setCurrentStep} />
    </AuthLayout>
    </>
  );
};

export default ForgotPassword;

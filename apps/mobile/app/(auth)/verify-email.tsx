import React from "react";

import ScreenView from "@/components/layouts/screenview";
import { SharedHeader } from "@/components/containers/shared";
import { VStack } from "@/components/shared";
import Text from "@/components/ui/text";
import VerifyEmailForm from "@/components/containers/auth/forms/verify-email-otp";

const VerifyEmailSignup = () => {
  return (
    <ScreenView>
      <VStack className="w-full flex-1" gap="6">
        <SharedHeader title="Verify Email Address" variant="auth" />
        <Text className="text-neutral-400">
          To verify email, we’ve sent a One Time Password (OTP) to
          justinchris@gmail.com{" "}
          <Text className="text-blue-400" weight="semiBold">
            (Change)
          </Text>
        </Text>
        <VerifyEmailForm />
      </VStack>
    </ScreenView>
  );
};

export default VerifyEmailSignup;

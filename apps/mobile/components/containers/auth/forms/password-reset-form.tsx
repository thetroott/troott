import React from "react";
import { VStack } from "@/components/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import OTPFormInput from "@/components/ui/otp-forminput";
import Button from "@/components/ui/button";
import TermsAndConditions from "@/components/containers/auth/TermsConditions";
import Text from "@/components/ui/text";
import { router } from "expo-router";
import { OTPSchema, OTPType } from "@/validation/otp";

const PasswordResetForm = () => {
  const form = useForm<OTPType>({
    defaultValues: { otp: "" },
    resolver: zodResolver(OTPSchema),
  });

  return (
    <VStack className="w-full">
      <OTPFormInput name="otp" control={form.control} />
      <TermsAndConditions />
      <Button
        label="Continue"
        disabled={!form.formState.isValid}
        onPress={() => router.push("/onboarding/select-ministers")}
      />
      <Text className="text-neutral-500">
        This code will expire in 5 minutes.{" "}
      </Text>
      <Text weight="semiBold" className="text-teal-500" size="base">
        Resend Code
      </Text>
    </VStack>
  );
};

export default PasswordResetForm;

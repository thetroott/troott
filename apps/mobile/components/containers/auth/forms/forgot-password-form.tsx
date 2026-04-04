import React from "react";
import { VStack } from "@/components/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/button";
import TermsAndConditions from "@/components/containers/auth/TermsConditions";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import { useRegisterStore } from "@/stores/register-store";
import { EmailSchema, EmailSchemaType } from "@/validation/email";
import FormInput from "@/components/ui/forminput";
import { Sms } from "iconsax-react-nativejs";

const ForgotPasswordForm = () => {
  const { setEmail, setUserEmail } = useRegisterStore();
  const form = useForm<EmailSchemaType>({
    defaultValues: { email: "" },
    resolver: zodResolver(EmailSchema),
  });

  const handleFormSubmit = (data: EmailSchemaType) => {
    setEmail(data.email);
    setUserEmail(true);
    router.push("/request-password-otp");
  };

  return (
    <VStack className="w-full">
      <FormInput
        name="email"
        control={form.control}
        label="email"
        leftIcon={<Sms color={theme.colors.grey[400]} size={20} />}
        containerStyle={{ width: theme.sizes.screen.width * 0.45 }}
      />
      <TermsAndConditions />
      <Button
        label="Continue"
        disabled={!form.formState.isValid}
        onPress={form.handleSubmit(handleFormSubmit)}
      />
    </VStack>
  );
};

export default ForgotPasswordForm;

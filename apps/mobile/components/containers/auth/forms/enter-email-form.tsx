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
import OAuth from "@/components/containers/auth/OAuth";

const EnterEmailForm = () => {
  const { setEmail, setUserEmail } = useRegisterStore();
  const form = useForm<EmailSchemaType>({
    defaultValues: { email: "" },
    resolver: zodResolver(EmailSchema),
  });

  const handleFormSubmit = (data: EmailSchemaType) => {
    setEmail(data.email);
    setUserEmail(true);
    router.push("/register");
  };

  return (
    <VStack className="w-full">
      <TermsAndConditions />
      <FormInput
        name="email"
        control={form.control}
        label="Email Address"
        leftIcon={<Sms color={theme.colors.grey[400]} size={20} />}
      />
      <Button
        label="Continue"
        disabled={!form.formState.isValid}
        onPress={form.handleSubmit(handleFormSubmit)}
      />
      <OAuth />
    </VStack>
  );
};

export default EnterEmailForm;

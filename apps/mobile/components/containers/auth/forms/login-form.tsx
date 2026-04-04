import React from "react";
import { VStack } from "@/components/shared";
import FormInput from "@/components/ui/forminput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Sms } from "iconsax-react-nativejs";
import { theme } from "@/constants/theme";
import Button from "@/components/ui/button";
import { router } from "expo-router";
import { LoginSchema, LoginSchemaType } from "@/validation/login";

const LoginForm = () => {
  const form = useForm<LoginSchemaType>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(LoginSchema),
  });

  return (
    <VStack className="w-full">
      <FormInput
        name="email"
        control={form.control}
        label="Email"
        placeholder="john.alabi@mail.com"
        leftIcon={<Sms color={theme.colors.grey[400]} size={20} />}
      />
      <FormInput
        name="password"
        control={form.control}
        label="Password"
        placeholder="*********"
        leftIcon={<Lock color={theme.colors.grey[400]} size={20} />}
      />
      <Button
        onPress={form.handleSubmit((data) => router.push("/(tabs)/home"))}
        disabled={!form.formState.isValid}
        label="Continue"
      />
    </VStack>
  );
};

export default LoginForm;


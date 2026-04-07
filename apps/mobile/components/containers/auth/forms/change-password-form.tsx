import { StyleSheet, View } from "react-native";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import OTPFormInput from "@/components/ui/otp-forminput";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import TermsAndConditions from "@/components/containers/auth/TermsConditions";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import { OTPSchema, OTPType } from "@/validation/otp";


const VerifyEmailForm = () => {
  const form = useForm<OTPType>({
    defaultValues: {
      otp: "",
    },
    resolver: zodResolver(OTPSchema),
  });
  const handleFormSubmit = () => {
    router.push("/onboarding/select-ministers");
  };
  return (
    <View style={styles.container}>
      <OTPFormInput name="otp" control={form.control} />
      <TermsAndConditions />
      <Button
        label="Continue"
        disabled={!form.formState.isValid}
        onPress={handleFormSubmit}
      />
      <Text color={theme.colors.grey[500]}>
        This code will expire in 5 minutes.{" "}
      </Text>
      <Text weight="semiBold" color={theme.colors.teal[500]} size="base">
        Resend Code
      </Text>
    </View>
  );
};

export default VerifyEmailForm;

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
});

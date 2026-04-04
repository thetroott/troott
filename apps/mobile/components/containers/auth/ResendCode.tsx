import { View } from "react-native";
import React from "react";
import Text from "@/components/ui/text";

const ResendCode = () => {
  return (
    <View>
      <View className="mt-2.5" />
      <Text className="text-neutral-400">
        This code will expire in 15 minutes.
      </Text>
      <View className="mt-2.5" />
      <Text
        className="text-teal-500 underline"
        onPress={() => console.log("Resend code Clicked")}
        accessibilityRole="button"
        accessibilityLabel="Resend code"
      >
        Resend code
      </Text>
    </View>
  );
};

export default ResendCode;

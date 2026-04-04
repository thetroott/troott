import { View } from "react-native";
import React from "react";
import Text from "@/components/ui/text";

const ResetSubtext = () => {
  return (
    <View>
      <View className="mt-2.5" />
      <Text className="text-neutral-400">
        Enter your account's email address, and we'll send you a one-time
        password (OTP) to reset it.
      </Text>
      <View className="mt-2.5" />
    </View>
  );
};

export default ResetSubtext;

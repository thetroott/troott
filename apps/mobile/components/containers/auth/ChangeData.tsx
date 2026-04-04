import { View } from "react-native";
import React from "react";
import Text from "@/components/ui/text";

const ChangeData = () => {
  return (
    <View>
      <View className="mt-2.5" />
      <Text className="text-neutral-400">
        To verify email, we've sent a One Time Password (OTP) to{" "}
      </Text>
      <View className="flex-row">
        <Text className="text-neutral-300">tobe.innocent@gmail.com </Text>
        <Text
          className="text-teal-500 underline"
          onPress={() => console.log("Change email clicked")}
          accessibilityRole="button"
          accessibilityLabel="Change email"
        >
          (Change)
        </Text>
      </View>
    </View>
  );
};

export default ChangeData;

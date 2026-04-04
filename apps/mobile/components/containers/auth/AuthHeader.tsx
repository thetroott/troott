import { View } from "react-native";
import React from "react";
import Text from "@/components/ui/text";

const AuthHeader = () => {
  return (
    <View>
      <Text className="text-neutral-400">
        By continuing, you agree to the updated{" "}
        <Text
          className="text-teal-500 underline"
          onPress={() => console.log("Terms of Sale Clicked")}
          accessibilityRole="link"
          accessibilityLabel="Terms of Sale"
        >
          Terms of Sale
        </Text>
        ,{" "}
        <Text
          className="text-teal-500 underline"
          onPress={() => console.log("Terms of Service Clicked")}
          accessibilityRole="link"
          accessibilityLabel="Terms of Service"
        >
          Terms of Service
        </Text>
        {" "}and{" "}
        <Text
          className="text-teal-500 underline"
          onPress={() => console.log("Privacy Policy Clicked")}
          accessibilityRole="link"
          accessibilityLabel="Privacy Policy"
        >
          Privacy Policy
        </Text>
        .
      </Text>
    </View>
  );
};

export default AuthHeader;
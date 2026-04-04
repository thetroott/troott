import { Text, View } from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { theme } from "@/constants/theme";
import Button from "@/components/ui/button";

const OAuth = () => {
  const signInWithGoogle = async () => {
    try {
      console.log("Google Sign-In Triggered");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  const signInWithApple = async () => {
    try {
      console.log("Apple Sign-In Triggered");
    } catch (error) {
      console.error("Apple Sign-In Error:", error);
    }
  };

  return (
    <View>
      <View className="flex-row items-center gap-2">
        <View className="h-px flex-1 bg-neutral-600" />
        <Text className="text-neutral-400">or</Text>
        <View className="h-px flex-1 bg-neutral-600" />
      </View>

      <View className="mt-2.5" />

      <Button
        label="Sign in with Apple"
        variant="outline"
        leftIcon={
          <Icon name="apple" size={18} color={theme.colors.grey[50]} />
        }
        className="rounded border-neutral-600 py-2"
        onPress={signInWithApple}
        isLoading={false}
        disabled={false}
      />

      <View className="mt-2.5" />

      <Button
        label="Continue with Google"
        variant="outline"
        leftIcon={
          <Icon name="google" size={18} color={theme.colors.grey[50]} />
        }
        className="rounded border-neutral-600 py-2"
        onPress={signInWithGoogle}
        isLoading={false}
        disabled={false}
      />
    </View>
  );
};

export default OAuth;

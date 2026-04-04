import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, Pressable } from "react-native";

type IError = {
  error: Error;
  resetError: () => void;
};

const Error = (props: IError) => {
  const { error, resetError } = props;

  return (
    <SafeAreaView className="flex-1 bg-neutral-950 justify-center items-center">
      <View className="px-6">
        <Text className="text-neutral-100 text-base">Something went wrong:</Text>
        <Text className="text-neutral-400 text-sm mt-2">{error.message}</Text>
        <Pressable
          onPress={resetError}
          className="bg-neutral-700 mt-6 px-6 py-3 rounded-lg self-start"
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text className="text-neutral-100 font-semibold">Try again</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Error;

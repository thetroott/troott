import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, Pressable } from "react-native";

export type Props = { error: Error; resetError: () => void };

const FallbackComponent = (props: Props) => (
  <SafeAreaView className="flex-1 justify-center items-center bg-neutral-950">
    <View className="justify-center items-center px-6">
      <Text className="text-2xl font-bold text-neutral-100">Oops!</Text>
      <Text className="text-base text-neutral-400 mt-2">
        There's an error
      </Text>
      <Text className="text-sm text-neutral-500 mt-2">
        {props.error.toString()}
      </Text>
      <Pressable
        className="mt-6 rounded-lg bg-teal-500 px-6 py-3 active:opacity-90"
        onPress={props.resetError}
        accessibilityRole="button"
        accessibilityLabel="Try again"
      >
        <Text className="font-semibold text-neutral-950">Try again</Text>
      </Pressable>
    </View>
  </SafeAreaView>
);

export default FallbackComponent;

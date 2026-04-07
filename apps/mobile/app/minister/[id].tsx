import React from "react";
import { useLocalSearchParams } from "expo-router";
import ScreenView from "@/components/layouts/screenview";
import Text from "@/components/ui/text";
import { View } from "react-native";

export default function MinisterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenView>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Minister {id ?? "—"}</Text>
      </View>
    </ScreenView>
  );
}

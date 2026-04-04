import React from "react";
import { useLocalSearchParams } from "expo-router";
import ScreenView from "@/components/layouts/screenview";
import Text from "@/components/ui/text";
import { View } from "react-native";

export default function SeriesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenView>
      <View className="flex-1 items-center justify-center">
        <Text>Series {id ?? "—"}</Text>
      </View>
    </ScreenView>
  );
}

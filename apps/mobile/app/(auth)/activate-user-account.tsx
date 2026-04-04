import React from "react";
import { View } from "react-native";
import Text from "@/components/ui/text";
import ScreenView from "@/components/layouts/screenview";

export default function ActivateUserAccountScreen() {
  return (
    <ScreenView>
      <View className="flex-1 items-center justify-center">
        <Text>Activate account</Text>
      </View>
    </ScreenView>
  );
}

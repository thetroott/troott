import React from "react";
import { View } from "react-native";
import Text from "@/components/ui/text";
import ScreenView from "@/components/layouts/screenview";

export default function ActivateUserAccountScreen() {
  return (
    <ScreenView>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Activate account</Text>
      </View>
    </ScreenView>
  );
}

import { View } from "react-native";
import React from "react";
import ScreenView from "@/components/layouts/screenview";
import Text from "@/components/ui/text";
import { Interests } from "@/components/containers/personalisation";

const SelectInterests = () => {
  return (
    <ScreenView className="mt-8 flex-1">
      <View className="gap-2.5">
        <Text size="xl" className="text-neutral-100" weight="medium">
          What topics interest you
        </Text>
        <Text size="sm" className="text-neutral-400">
          Pick 5 favorite intersts to customize your home feed
        </Text>
      </View>
      <Interests />
    </ScreenView>
  );
};

export default SelectInterests;

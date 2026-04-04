import { View } from "react-native";
import React from "react";
import Text from "@/components/ui/text";
import ScreenView from "@/components/layouts/screenview";
import { FavoriteMinisters } from "@/components/containers/personalisation";

const SelectMinisters = () => {
  return (
    <ScreenView className="mt-8 flex-1">
      <View className="gap-2.5">
        <Text size="xl" className="text-neutral-100" weight="medium">
          Pick 5 ministers you like
        </Text>
        <Text size="sm" className="text-neutral-400">
          Your experience will improve the more you listen
        </Text>
      </View>
      <FavoriteMinisters />
    </ScreenView>
  );
};

export default SelectMinisters;

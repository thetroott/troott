import { Pressable, View } from "react-native";
import React from "react";
import { Notification, SearchNormal } from "iconsax-react-nativejs";
import { theme } from "@/constants/theme";
import Text from "@/components/ui/text";

const LibraryHeader = () => {
  return (
    <View className="flex-row items-center justify-between">
      <Text weight="semiBold" size="xl" className="text-neutral-100">
        Library
      </Text>
      <View className="flex-row items-center gap-4">
        <Pressable accessibilityRole="button" accessibilityLabel="Search">
          <SearchNormal color={theme.colors.white[50]} size={20} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications">
          <Notification color={theme.colors.white[50]} variant="Bold" size={20} />
        </Pressable>
      </View>
    </View>
  );
};

export default LibraryHeader;

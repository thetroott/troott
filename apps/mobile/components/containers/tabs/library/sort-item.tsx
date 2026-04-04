import { Pressable } from "react-native";
import React from "react";
import Text from "@/components/ui/text";
import { SolidIcons } from "@/assets/icons";
import { theme } from "@/constants/theme";

interface CategoryProp {
  selected?: boolean;
  onPress?: () => void;
  name?: string;
}

const SortItem = ({ selected, onPress, name }: CategoryProp) => {
  return (
    <Pressable
      className="flex-row items-center justify-between"
      onPress={onPress}
    >
      <Text
        size="base"
        className={selected ? "text-neutral-100" : "text-neutral-500"}
      >
        {name}
      </Text>
      {selected && (
        <SolidIcons.CheckCircleIcon color={theme.colors.white[50]} size={18} />
      )}
    </Pressable>
  );
};

export default SortItem;

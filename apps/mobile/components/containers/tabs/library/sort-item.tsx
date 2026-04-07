import { Pressable, StyleSheet } from "react-native";
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
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      onPress={onPress}
    >
      <Text size="base" color={selected ? theme.colors.white[50] : theme.colors.grey[400]}>{name}</Text>
      {selected && <SolidIcons.CheckCircleIcon color={theme.colors.white[50]} size={18} />}
    </Pressable>
  );
};

export default SortItem;

const styles = StyleSheet.create({});

import { Pressable } from "react-native";
import React from "react";
import Text from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface CategoryProp {
  selected?: boolean;
  onPress?: () => void;
  name?: string;
  id?: number;
}

const CategoryItem = ({ selected, onPress, name, id }: CategoryProp) => {
  return (
    <Pressable
      key={id}
      className={cn(
        "mr-2 rounded px-4 py-4",
        selected ? "bg-neutral-100" : "border border-neutral-600/50 bg-neutral-600/30"
      )}
      onPress={onPress}
    >
      <Text
        className={selected ? "text-neutral-900" : "text-neutral-100"}
      >
        {name}
      </Text>
    </Pressable>
  );
};

export default CategoryItem;
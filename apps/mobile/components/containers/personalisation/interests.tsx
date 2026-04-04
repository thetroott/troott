import { Pressable, ScrollView, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Add, SearchNormal } from "iconsax-react-nativejs";
import { theme } from "@/constants/theme";
import { useSemanticColors } from "@/hooks/use-semantic-colors";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { router } from "expo-router";
import { SolidIcons } from "@/assets/icons";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { topics } from "@/_data/topics";

const Interests = () => {
  return (
    <View className="flex-1 gap-6">
      <Input
        leftIcon={<SearchNormal size={20} color={theme.colors.grey[100]} />}
        placeholder="Search for more interests"
      />
      <ScrollView className="flex-1">
        <View className="gap-6 pb-40">
          {topics.map((interest) => (
            <InterestGroup
              title={interest.name}
              key={interest.id}
              items={interest.items}
            />
          ))}
        </View>
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 gap-5 bg-black/90 p-4">
        <Button
          className="flex-row items-center gap-2"
          onPress={() => router.push("/(tabs)/home")}
        >
          <SolidIcons.PlayIcon />
          <Text className="text-neutral-900">Start Playing</Text>
        </Button>
        <Button label="Skip" variant="ghost" />
      </View>
    </View>
  );
};

interface InterestGroupProps {
  title: string;
  items: {
    name: string;
    id: string;
  }[];
}
function InterestGroup({ title, items }: InterestGroupProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  function handlepress(id: string) {
    if (selectedItems.some((i) => i === id)) {
      setSelectedItems((prev) => prev.filter((i) => i !== id));
      return;
    }
    setSelectedItems((prev) => [...prev, id]);
  }
  return (
    <View className="gap-4">
      <Text size="md" weight="semiBold">
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-4">
        {items.map((item) => (
          <InterestItem
            {...item}
            selected={selectedItems.some((i) => i === item.id)}
            key={item.id}
            onPress={() => handlepress(item.id)}
          />
        ))}
      </View>
    </View>
  );
}

interface ItemProp {
  name: string;
  selected: boolean;
  id: string;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedAddIcon = Animated.createAnimatedComponent(Add);

function InterestItem({ name, selected, onPress }: ItemProp) {
  const { background, primary } = useSemanticColors();
  const selectProgress = useSharedValue(0);
  const rotateProgress = useSharedValue("0deg");
  const animatedStyles = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      selectProgress.value,
      [0, 1],
      [background, primary]
    ),
  }));
  const animatedIconStyles = useAnimatedStyle(() => ({
    transform: [{ rotateZ: rotateProgress.value }],
  }));
  useEffect(() => {
    if (!selected) {
      selectProgress.value = withTiming(0);
      rotateProgress.value = withTiming("0deg", { duration: 400 });
      return;
    }
    selectProgress.value = withTiming(1);
    rotateProgress.value = withTiming("45deg", { duration: 400 });
  }, [selected]);
  return (
    <AnimatedPressable
      className="px-4 py-2 border border-neutral-600 flex-row items-center gap-2 rounded"
      style={animatedStyles}
      onPress={onPress}
    >
      <Text
        className={selected ? "text-neutral-600" : "text-neutral-300"}
      >
        {name}
      </Text>
      <AnimatedAddIcon
        style={animatedIconStyles}
        size={20}
        color={selected ? theme.colors.grey[900] : theme.colors.grey[300]}
      />
    </AnimatedPressable>
  );
}

export default Interests;

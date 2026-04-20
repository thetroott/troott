import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Add, SearchNormal } from "iconsax-react-nativejs";
import { theme } from "@/constants/theme";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SolidIcons } from "@/assets/icons";
import { replaceWithPendingTargetOrHome } from "@/lib/deep-link/replace-with-pending-or-home";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { topics } from "@/_data/topics";

const Interests = () => {
  return (
    <View style={styles.container}>
      <Input
        leftIcon={<SearchNormal size={20} color={theme.colors.grey[100]} />}
        placeholder="Search for more interests"
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContainer}
      >
        {topics.map((interest, index) => (
          <InterestGroup
            title={interest.name}
            key={interest.id}
            items={interest.items}
          />
        ))}
      </ScrollView>
      <View style={styles.bottomContainer}>
        <Button
          containerStyle={styles.buttonStyle}
          // disabled={selectedPastors.length < 5}
          onPress={() => {
            void replaceWithPendingTargetOrHome();
          }}
        >
          <SolidIcons.PlayIcon />
          <Text color={theme.colors.grey[900]}>Start Playing</Text>
        </Button>
        <Button
          label="Skip"
          variant="ghost"
          onPress={() => {
            void replaceWithPendingTargetOrHome();
          }}
        />
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
    <View style={styles.groupContainer}>
      <Text size="md" weight="semiBold">
        {title}
      </Text>
      <View style={styles.itemsContainer}>
        {items.map((item, index) => {
          return (
            <InterestItem
              {...item}
              selected={selectedItems.some((i) => i === item.id)}
              key={item.id}
              onPress={() => {
                handlepress(item.id);
              }}
            />
          );
        })}
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
const AnimatedAddIcon = Animated.createAnimatedComponent(Add)
function InterestItem({ name, id, selected, onPress }: ItemProp) {
  const selectProgress = useSharedValue(0);
  const rotateProgress = useSharedValue('0deg')
  const animatedStyles = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      selectProgress.value,
      [0, 1],
      [theme.colors.grey[900], theme.colors.teal[500]]
    ),
  }));
  const animatedIconStyles = useAnimatedStyle(()=>({
    transform: [{ rotateZ: rotateProgress.value}]
  }))
  useEffect(() => {
    if (!selected) {
      selectProgress.value = withTiming(0);
      rotateProgress.value= withTiming('0deg',{duration:400})
      return;
    }
    selectProgress.value = withTiming(1);
    rotateProgress.value = withTiming('45deg',{duration:400})
  }, [selected]);
  return (
    <AnimatedPressable
      style={[styles.interestItem, animatedStyles]}
      onPress={onPress}
    >
      <Text color={selected ? theme.colors.grey[700] : theme.colors.grey[300]}>
        {name}
      </Text>

      <AnimatedAddIcon
        style={animatedIconStyles}
        size={20}
        color={selected ? theme.colors.grey[900]: theme.colors.grey[300]}
      />
    </AnimatedPressable>
  );
}

export default Interests;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.sizes.spacing.xl,
  },
  itemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.sizes.spacing.md,
  },
  interestItem: {
    paddingHorizontal: theme.sizes.spacing.base,
    paddingVertical: theme.sizes.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.grey[700],
    flexDirection: "row",
    alignItems: "center",
    gap: theme.sizes.spacing.sm,
    borderRadius: theme.sizes.radius.sm,
  },
  scrollContainer: {
    gap: theme.sizes.spacing.lg,
    paddingBottom: 150,
  },
  groupContainer: {
    gap: theme.sizes.spacing.base,
  },
  bottomContainer: {
    position: "absolute",
    gap: 20,
    bottom: 0,
    padding: theme.sizes.spacing.base,
    backgroundColor: "#000000",
    left: 0,
    right: 0,
    opacity: 0.9,
  },
  buttonStyle: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.sizes.spacing.sm,
  },
});

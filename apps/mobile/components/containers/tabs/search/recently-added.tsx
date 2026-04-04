import { View } from "react-native";
import React from "react";
import Text from "@/components/ui/text";
import { FlashList } from "@shopify/flash-list";
import { theme } from "@/constants/theme";
import { TransformArray } from "@/utils/transform-array";
import { TrackCard } from "@/components/containers/player-old";

const RecentlyAdded = () => {
  return (
    <View className="gap-4">
      <Text className="text-neutral-100">Recently Added</Text>
      <FlashList
        data={TransformArray([1, 2, 3, 4, 5, 6, 7, 8], 2)}
        keyExtractor={(_, index) => index + "group"}
        horizontal
        snapToInterval={theme.sizes.screen.width * 0.8}
        showsHorizontalScrollIndicator={false}
        estimatedItemSize={290}
        decelerationRate={-1}
        renderItem={({ item }) => (
          <View className="mr-2.5 gap-2.5">
            {item.map((_, idx) => (
              <TrackCard
                key={idx + "track"}
                title="Beauty for ashes"
                image={require("@/assets/images/cover.jpg")}
                duration="23:12"
                minister="Apostle Joshua Selman"
                variant="small"
              />
            ))}
          </View>
        )}
      />
    </View>
  );
};

export default RecentlyAdded;

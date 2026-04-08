import { StyleSheet, View } from "react-native";
import React from "react";
import Text from "@/components/ui/text";
import { FlashList } from "@shopify/flash-list";
import { theme } from "@/constants/theme";

import { TransformArray } from "@/utils/transform-array";
import { TrackCard } from "@/components/containers/player-old";

const RecentlyAdded = () => {
  return (
    <View style={styles.container}>
      <Text color={theme.colors.white[50]} >Recently Added</Text>
      <FlashList
        data={TransformArray([1, 2, 3, 4, 5, 6, 7, 8],2)}
        keyExtractor={(item, index) => index + "group"}
        horizontal
        snapToInterval={theme.sizes.screen.width * 0.8}
        showsHorizontalScrollIndicator={false}
        decelerationRate={-1}
        renderItem={({ item, index }) => (
          <View style={{ gap: 10, marginRight: 10 }}>
            {item.map((_, index) => (
              <TrackCard
                key={index + "track"}
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

const styles = StyleSheet.create({
    container:{
        gap:theme.sizes.spacing.md
    }
});

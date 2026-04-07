import { Image, StyleSheet, View } from "react-native";
import React from "react";
import { theme } from "@/constants/theme";
import { FlashList } from "@shopify/flash-list";
import Text from "@/components/ui/text";
import { SeeMore } from "@/components/containers/navigation";
import { TrackCard } from "@/components/containers/player-old";
import { useSermonsCatalog } from "@/engine/hooks/useSermonsCatalog";
import { ISermonTrack } from "@/dtos/sermon.dto";
import { tracks } from "@/_data/_mock/tracks";

const FALLBACK_TRACK_IMAGE = require("@/assets/images/liked.png");

const MoreFromMinister = () => {
  const { data: sermons, isLoading } = useSermonsCatalog();
  
  // Use fallback data if sermons are not loaded
  const dataSource = sermons && sermons.length > 0 ? sermons : tracks;
  
  // Filter sermons by a specific minister (Apostle Joshua Selman in this case)
  const ministerSermons = dataSource?.filter(sermon => 
    (sermon.artist || sermon.minister)?.includes("Apostle Joshua Selman")
  ) || [];

  console.log('MoreFromminister - dataSource length:', dataSource?.length, 'ministerSermons length:', ministerSermons.length);
  
  const ministerName = ministerSermons.length > 0 
    ? (ministerSermons[0].artist || ministerSermons[0].minister) 
    : "Pastor Sam Adeyemi";
  
  if (isLoading && (!dataSource || dataSource.length === 0)) {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={require("@/assets/images/2.jpg")}
            />
            <View style={{ gap: theme.sizes.spacing.sm }}>
              <Text>More From</Text>
              <Text color={theme.colors.white[50]} weight="semiBold" size="md">
                Loading...
              </Text>
            </View>
          </View>
          <SeeMore />
        </View>
        <Text style={{ color: theme.colors.grey[300], textAlign: 'center', paddingVertical: 20 }}>
          Loading sermons...
        </Text>
      </View>
    );
  }
  
  const sermonsToShow = ministerSermons.length > 0 ? ministerSermons.slice(0, 6) : dataSource?.slice(0, 6) || [];
  
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={require("@/assets/images/2.jpg")}
          />
          <View style={{ gap: theme.sizes.spacing.sm }}>
            <Text>More From</Text>
            <Text color={theme.colors.white[50]} weight="semiBold" size="md">
              {ministerName}
            </Text>
          </View>
        </View>
        <SeeMore />
      </View>
      <FlashList
        data={sermonsToShow}
        keyExtractor={(item) => item.id + "more"}
        horizontal
        snapToInterval={theme.sizes.screen.width * 0.6}
        showsHorizontalScrollIndicator={false}
        decelerationRate={-1}
        estimatedItemSize={290}
        renderItem={({ item }) => {
          const sermon = item as any; // Handle both ISermonTrack and mock track types
          return (
            <TrackCard
              id={sermon.id}
              url={sermon.url ?? sermon.sermon}
              sermon={sermon.sermon ?? sermon.url}
              title={sermon.title || ""}
              artist={sermon.artist || sermon.minister || ""}
              minister={sermon.minister || sermon.artist || ""}
              duration={sermon.duration || 0}
              artwork={sermon.artwork ?? sermon.image}
              image={sermon.image ?? sermon.artwork ?? FALLBACK_TRACK_IMAGE}
              variant="large"
              cardStyle={{
                marginRight: theme.sizes.spacing.md,
                width: theme.sizes.screen.width * 0.7,
              }}
            />
          );
        }}
      />
    </View>
  );
};

export default MoreFromMinister;

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  container: {
    gap: theme.sizes.spacing.lg,
  },
  imageContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  image: {
    height: 48,
    width: 48,
    borderRadius: theme.sizes.radius.full,
  },
});

import { Image, View } from "react-native";
import React from "react";
import { theme } from "@/constants/theme";
import { FlashList } from "@shopify/flash-list";
import Text from "@/components/ui/text";
import { SeeMore } from "@/components/containers/navigation";
import { TrackCard } from "@/components/containers/player-old";
import { tracks } from "@/_data/_mock/tracks";
import { useSermonsCatalogQuery } from "@/engine/hooks/useSermonsCatalogQuery";

const MoreFromMinister = () => {
  const { data: sermons, isLoading } = useSermonsCatalogQuery();
  const dataSource = sermons && sermons.length > 0 ? sermons : tracks;
  const ministerSermons =
    dataSource?.filter((sermon) => {
      const legacy = sermon as { artist?: string | null; minister?: string | null };
      const name = legacy.minister ?? legacy.artist;
      return name?.includes("Apostle Joshua Selman");
    }) ?? [];
  const ministerName =
    ministerSermons.length > 0
      ? (() => {
          const first = ministerSermons[0] as { artist?: string | null; minister?: string | null };
          return first.minister ?? first.artist;
        })()
      : "Pastor Sam Adeyemi";

  if (isLoading && (!dataSource || dataSource.length === 0)) {
    return (
      <View className="gap-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <Image
              source={require("@/assets/images/2.jpg")}
              className="h-12 w-12 rounded-full"
            />
            <View className="gap-2">
              <Text>More From</Text>
              <Text className="text-neutral-100" weight="semiBold" size="md">
                Loading...
              </Text>
            </View>
          </View>
          <SeeMore />
        </View>
        <Text className="py-5 text-center text-neutral-400">
          Loading sermons...
        </Text>
      </View>
    );
  }

  const sermonsToShow =
    ministerSermons.length > 0
      ? ministerSermons.slice(0, 6)
      : dataSource?.slice(0, 6) ?? [];

  return (
    <View className="gap-6">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <Image
            source={require("@/assets/images/2.jpg")}
            className="h-12 w-12 rounded-full"
          />
          <View className="gap-2">
            <Text>More From</Text>
            <Text className="text-neutral-100" weight="semiBold" size="md">
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
          const sermon = item as any;
          return (
            <TrackCard
              id={sermon.id}
              url={sermon.url || sermon.sermon}
              title={sermon.title || ""}
              artist={sermon.artist || sermon.minister || ""}
              duration={sermon.duration || 0}
              artwork={sermon.artwork || sermon.image}
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

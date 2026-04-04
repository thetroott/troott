import React, { useState } from "react";
import { View, Pressable, FlatList, ScrollView } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, More } from "iconsax-react-nativejs";
import ScreenView from "@/components/layouts/screenview";
import Text from "@/components/ui/text";
import { theme } from "@/constants/theme";
import { tracks } from "@/_data/_mock/tracks";
import { SermonTrackDTO } from "@/dtos/sermon.dto";
import { useSermonsCatalogQuery } from "@/engine/hooks/useSermonsCatalogQuery";
import { usePlayFromCatalog } from "@/engine/hooks/usePlayFromCatalog";
import { Image } from "react-native";
import { cn } from "@/lib/utils";

const SermonsForYou = () => {
  const { data: sermons, isLoading } = useSermonsCatalogQuery();
  const playFromCatalog = usePlayFromCatalog("Library");
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Faith", "Bible Study", "Daily Devotion"];

  // Use sermons data or fallback to tracks
  const sermonsData = sermons && sermons.length > 0 ? sermons : tracks;

  const handleTrackPress = async (track: SermonTrackDTO) => {
    try {
      await playFromCatalog(track);
    } catch (error) {
      console.error("Failed to play track:", error);
    }
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const renderSermonItem = ({ item }: { item: any }) => {
    const sermonTrack = item as SermonTrackDTO;
    // Support both local require() numbers and remote URLs
    const artworkSource: any = (() => {
      if (typeof (sermonTrack as any).artwork === "number") return (sermonTrack as any).artwork;
      if (typeof (sermonTrack as any).image === "number") return (sermonTrack as any).image;
      const url =
        (typeof (sermonTrack as any).artwork === "string" && (sermonTrack as any).artwork) ||
        (typeof (sermonTrack as any).image === "string" && (sermonTrack as any).image) ||
        null;
      if (url && /^https?:\/\//.test(url)) return { uri: url };
      return null;
    })();

    return (
      <Pressable
        className="flex-row items-center border-b border-neutral-800 bg-neutral-950 py-4"
        onPress={() => handleTrackPress(sermonTrack)}
      >
        <View className="mr-4 h-[50px] w-[50px]">
          {artworkSource ? (
            <Image source={artworkSource} className="h-[50px] w-[50px] rounded" />
          ) : (
            <View className="h-[50px] w-[50px] items-center justify-center overflow-hidden rounded bg-neutral-700">
              <Text className="text-xl text-neutral-400">♪</Text>
            </View>
          )}
        </View>

        <View className="mr-2 flex-1">
          <Text
            size="sm"
            className="text-neutral-100"
            weight="medium"
            numberOfLines={2}
          >
            {sermonTrack.title || "Untitled"}
          </Text>
          <Text size="xs" className="mt-0.5 text-neutral-500">
            {sermonTrack.artist || sermonTrack.minister || "Unknown Artist"} •{" "}
            {formatDuration(sermonTrack.duration || 0)}
          </Text>
        </View>

        <Pressable className="p-2" accessibilityRole="button" accessibilityLabel="More options">
          <More size={20} color={theme.colors.grey[400]} />
        </Pressable>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <ScreenView className="bg-neutral-950">
        <View className="flex-row items-center justify-between bg-neutral-950 px-4">
          <Pressable
            onPress={() => router.back()}
            className="p-1"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={24} color={theme.colors.white[100]} />
          </Pressable>
          <Text size="lg" className="text-neutral-100" weight="semiBold">
            Sermons for you
          </Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 items-center justify-center bg-neutral-950">
          <Text className="text-neutral-100">Loading sermons...</Text>
        </View>
      </ScreenView>
    );
  }

  return (
    <ScreenView className="bg-neutral-950">
      <View className="flex-row items-center justify-between bg-neutral-950 px-4">
        <Pressable
          onPress={() => router.back()}
          className="p-1"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color={theme.colors.white[100]} />
        </Pressable>
        <Text size="lg" className="text-neutral-100" weight="semiBold">
          Sermons for you
        </Text>
        <View className="w-6" />
      </View>

      <View className="mb-4 flex-row gap-2 px-4 bg-neutral-950">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {filters.map((filter) => (
              <Pressable
                key={filter}
                className={cn(
                  "rounded-full border px-4 py-2",
                  activeFilter === filter
                    ? "border-teal-500 bg-teal-500"
                    : "border-neutral-600 bg-transparent"
                )}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  size="sm"
                  className={activeFilter === filter ? "text-neutral-900" : "text-neutral-100"}
                  weight={activeFilter === filter ? "semiBold" : "medium"}
                >
                  {filter}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <FlatList
        data={sermonsData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSermonItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        className="bg-neutral-950"
      />
    </ScreenView>
  );
};

export default SermonsForYou;
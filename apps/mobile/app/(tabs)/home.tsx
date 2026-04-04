import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import ScreenView from "@/components/layouts/screenview";
import Text from "@/components/ui/text";
import { Notification } from "iconsax-react-nativejs";
import { theme } from "@/constants/theme";
import Button from "@/components/ui/button";
import { FlashList } from "@shopify/flash-list";
import { TransformArray } from "@/utils/transform-array";
import { TrackCard } from "@/components/containers/player-old";
import UserHighlights from "@/components/containers/tabs/home/user-highlight";
import LikedByUser from "@/components/containers/tabs/home/liked-by-user";
import {
  MoreFromPreacher,
  TrendingPlaylist,
} from "@/components/containers/tabs/home";
import { SermonTrackDTO } from "@/dtos/sermon.dto";
import { tracks } from "@/_data/_mock/tracks";
import { useSermonsCatalogQuery } from "@/engine/hooks/useSermonsCatalogQuery";
import { usePlayFromCatalog } from "@/engine/hooks/usePlayFromCatalog";

const Home = () => {
  const { data: sermons, isLoading } = useSermonsCatalogQuery();
  const playFromCatalog = usePlayFromCatalog("Library");

  const handleTrackPress = async (track: SermonTrackDTO) => {
    try {
      await playFromCatalog(track);
    } catch (error) {
      console.error("Failed to play track:", error);
    }
  };

  const SermonsForYou = () => {
    const sermonsData =
      sermons && sermons.length > 0 ? sermons : tracks;

    if (isLoading && (!sermonsData || sermonsData.length === 0)) {
      return (
        <View className="gap-4">
          <View className="flex-row justify-between items-center">
            <Text size="md" color={theme.colors.white[100]} weight="semiBold">
              Sermons for you
            </Text>
            <View className="rounded-full border border-neutral-600">
              <Button variant="outline">
                <Text size="xs" color={theme.colors.white[100]}>
                  See more
                </Text>
              </Button>
            </View>
          </View>
          <Text className="text-neutral-100 text-center py-6">
            Loading sermons...
          </Text>
        </View>
      );
    }

    if (!sermonsData || sermonsData.length === 0) {
      return (
        <View className="gap-4">
          <View className="flex-row justify-between items-center">
            <Text size="md" color={theme.colors.white[100]} weight="semiBold">
              Sermons for you
            </Text>
            <View className="rounded-full border border-neutral-600">
              <Button variant="outline">
                <Text size="xs" color={theme.colors.white[100]}>
                  See more
                </Text>
              </Button>
            </View>
          </View>
          <Text className="text-neutral-400 text-center py-6">
            No sermons available at the moment.
          </Text>
        </View>
      );
    }

    const grouped = TransformArray(sermonsData, 4);

    return (
      <View className="gap-4">
        <View className="flex-row justify-between items-center">
          <Text size="md" color={theme.colors.white[100]} weight="semiBold">
            Sermons for you
          </Text>
          <View className="rounded-full border border-neutral-600">
            <Button variant="outline">
              <Text size="xs" color={theme.colors.white[100]}>
                See more
              </Text>
            </Button>
          </View>
        </View>

        <FlashList
          data={grouped}
          keyExtractor={(_, index) => index + "-group"}
          horizontal
          snapToInterval={theme.sizes.screen.width * 0.8}
          showsHorizontalScrollIndicator={false}
          decelerationRate={-1}
          estimatedItemSize={290}
          renderItem={({ item: group }) => (
            <View className="gap-2 mr-2">
              {group.map((track) => {
                const sermonTrack = track as {
                  id: string;
                  url?: string;
                  sermon?: string;
                  title?: string;
                  artist?: string;
                  minister?: string;
                  duration?: number;
                  artwork?: string;
                  image?: string;
                };
                return (
                  <Pressable
                    key={sermonTrack.id}
                    onPress={() => handleTrackPress(sermonTrack as SermonTrackDTO)}
                  >
                    <TrackCard
                      id={sermonTrack.id}
                      url={sermonTrack.url || sermonTrack.sermon}
                      title={sermonTrack.title ?? ""}
                      artist={
                        (sermonTrack.artist ?? sermonTrack.minister ?? "") as string
                      }
                      duration={sermonTrack.duration ?? 0}
                      artwork={
                        sermonTrack.artwork ?? sermonTrack.image ?? ""
                      }
                      variant="small"
                    />
                  </Pressable>
                );
              })}
            </View>
          )}
        />
      </View>
    );
  };

  return (
    <ScreenView>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <View className="gap-8">
          <ContinueListening />
          <View className="flex-row justify-between">
            <UserHighlights />
            <LikedByUser />
          </View>
        </View>
        <View className="mt-8" />
        <SermonsForYou />
        <View className="mt-8" />
        <MoreFromPreacher />
        <View className="mt-8" />
        <TrendingPlaylist />
        <View className="h-24" />
      </ScrollView>
    </ScreenView>
  );
};

function Header() {
  return (
    <View>
      <View className="flex-row justify-between items-center">
        <View className="items-end">
          <Text size="xl" weight="medium" color={theme.colors.white[100]}>
            Hi Damola,
          </Text>
        </View>
        <Pressable className="items-end" accessibilityRole="button" accessibilityLabel="Notifications">
          <Notification
            color={theme.colors.grey[100]}
            size={28}
            variant="Bold"
          />
        </Pressable>
      </View>
    </View>
  );
}

function ContinueListening() {
  return (
    <View>
      <Text size="base" color={theme.colors.grey[300]}>
        Continue Listening
      </Text>
    </View>
  );
}

export default Home;

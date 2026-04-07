import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import React from "react";
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
import { MoreFromPreacher, TrendingPlaylist } from "@/components/containers/tabs/home";
import type { ISermonTrack } from "@/dtos/sermon.dto";
import { tracks } from "@/_data/_mock/tracks";
import { useSermonsCatalog } from "@/engine/hooks/useSermonsCatalog";
import { usePlayFromCatalogList } from "@/hooks/player/use-play-from-catalog-list";

const FALLBACK_TRACK_IMAGE = require("@/assets/images/liked.png");

const Home = () => {
  const { data: sermons, isLoading, error } = useSermonsCatalog();
  const playFromCatalog = usePlayFromCatalogList("Library");

  const handleTrackPress = async (track: ISermonTrack) => {
    try {
      const sermonsData =
        sermons && sermons.length > 0 ? sermons : (tracks as ISermonTrack[]);
      const index = sermonsData.findIndex((t) => t.id === track.id);
      if (index === -1) return;
      await playFromCatalog(sermonsData, index);
    } catch (err) {
      console.error("Failed to play track:", err);
    }
  };

  const SermonsForYou = () => {
    const sermonsData =
      sermons && sermons.length > 0 ? sermons : (tracks as ISermonTrack[]);

    if (isLoading && (!sermonsData || sermonsData.length === 0)) {
      return (
        <View style={{ gap: theme.sizes.spacing.md }}>
          <View style={styles.sectionHeader}>
            <Text size="md" color={theme.colors.white[100]} weight="semiBold">
              Sermons for you
            </Text>
            <Button variant="outline" containerStyle={styles.seeMore}>
              <Text size="xs" color={theme.colors.white[100]}>
                See more
              </Text>
            </Button>
          </View>
          <Text style={{ color: theme.colors.white[100], textAlign: 'center', paddingVertical: 20 }}>
            Loading sermons...
          </Text>
        </View>
      );
    }

    if (error && (!sermonsData || sermonsData.length === 0)) {
      return (
        <View style={{ gap: theme.sizes.spacing.md }}>
          <View style={styles.sectionHeader}>
            <Text size="md" color={theme.colors.white[100]} weight="semiBold">
              Sermons for you
            </Text>
            <Button variant="outline" containerStyle={styles.seeMore}>
              <Text size="xs" color={theme.colors.white[100]}>
                See more
              </Text>
            </Button>
          </View>
          <Text style={{ color: theme.colors.grey[300], textAlign: 'center', paddingVertical: 20 }}>
            Could not load sermons.
          </Text>
        </View>
      );
    }

    if (!sermonsData || sermonsData.length === 0) {
      return (
        <View style={{ gap: theme.sizes.spacing.md }}>
          <View style={styles.sectionHeader}>
            <Text size="md" color={theme.colors.white[100]} weight="semiBold">
              Sermons for you
            </Text>
            <Button variant="outline" containerStyle={styles.seeMore}>
              <Text size="xs" color={theme.colors.white[100]}>
                See more
              </Text>
            </Button>
          </View>
          <Text style={{ color: theme.colors.grey[300], textAlign: 'center', paddingVertical: 20 }}>
            No sermons available at the moment.
          </Text>
        </View>
      );
    }

    const grouped = TransformArray(sermonsData, 4);

    return (
      <View style={{ gap: theme.sizes.spacing.md }}>
        <View style={styles.sectionHeader}>
          <Text size="md" color={theme.colors.white[100]} weight="semiBold">
            Sermons for you
          </Text>
          <Button variant="outline" containerStyle={styles.seeMore}>
            <Text size="xs" color={theme.colors.white[100]}>
              See more
            </Text>
          </Button>
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
            <View style={{ gap: 10, marginRight: 10, borderWidth: 1, borderColor: '#ff00ff' }}>
              {group.map((trackItem) => {
                const sermonTrack = trackItem as ISermonTrack;
                return (
                  <Pressable
                    key={sermonTrack.id ?? ""}
                    onPress={() => handleTrackPress(sermonTrack)}
                  >
                    <TrackCard
                      id={sermonTrack.id ?? undefined}
                      url={sermonTrack.url ?? sermonTrack.sermon ?? undefined}
                      sermon={sermonTrack.sermon ?? sermonTrack.url ?? undefined}
                      title={String(sermonTrack.title ?? "")}
                      artist={String(sermonTrack.artist ?? sermonTrack.minister ?? "")}
                      minister={String(sermonTrack.minister ?? sermonTrack.artist ?? "")}
                      duration={sermonTrack.duration ?? 0}
                      artwork={(sermonTrack.artwork ?? sermonTrack.image) ?? undefined}
                      image={sermonTrack.image ?? sermonTrack.artwork ?? FALLBACK_TRACK_IMAGE}
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
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        <Header />
        <View style={{ gap: theme.sizes.spacing.xl }}>
          <ContinueListening />

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <UserHighlights />
            <LikedByUser />
          </View>
        </View>
        <View style={{ marginTop: theme.sizes.spacing.xl }}></View>
        <SermonsForYou />
        <View style={{ marginTop: theme.sizes.spacing.xl }}></View>
        <MoreFromPreacher />
        <View style={{ marginTop: theme.sizes.spacing.xl }}></View>
        <TrendingPlaylist />
      </ScrollView>
    </ScreenView>
  );
};

function Header() {
  return (
    <View>
      <View style={styles.headerIcons}>
        <View style={{ alignItems: "flex-end" }}>
          <Text size="xl" weight="medium" color={theme.colors.white[100]}>
            Hi Damola,
          </Text>
        </View>
        <Pressable style={{ alignItems: "flex-end" }}>
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

const styles = StyleSheet.create({
  headerIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  seeMore: {
    borderRadius: theme.sizes.radius.full,
    width: "auto",
    paddingHorizontal: theme.sizes.spacing.base,
    height: "auto",
    paddingVertical: theme.sizes.spacing.sm,
    borderColor: theme.colors.grey[400],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

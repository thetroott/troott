import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import type { ITrackCard } from "./types";
import Text from "@/components/ui/text";
import { theme } from "@/constants/theme";
import { SolidIcons } from "@/assets/icons";
import { TrackListActions } from "./actions";
import {
  BottomSheetModal,
  BottomSheetRef,
} from "@/components/ui/bottom-sheet-modal";
import { usePlayFromCatalogList } from "@/hooks/player/use-play-from-catalog-list";

export type TrackCardProps = ITrackCard & {
  url?: string | number;
  artist?: string;
  artwork?: string | number;
};

const TrackCard = (data: TrackCardProps) => {
  
  const {
    id,
    url,
    title,
    variant = "small",
    minister,
    duration,
    image,
    artwork,
    cardStyle,
    sermon,
  } = data as any;

  // Accept both `image` and `artwork` field names (different callers use both)
  const resolvedImage = (artwork ?? image) as ImageSourcePropType;

  const playFromCatalog = usePlayFromCatalogList("Library");

  async function handlePress() {
    if (id == null) return;

    const playbackRef =
      url ?? (sermon as string | number | null | undefined) ?? null;

    const normalized = {
      id,
      sourceType: "stream" as const,
      url: playbackRef,
      sermon: playbackRef,
      title: title ?? null,
      artist: data.artist ?? minister ?? null,
      minister: minister ?? data.artist ?? null,
      duration: duration ?? null,
      artwork: data.artwork ?? data.image ?? null,
      image: data.image ?? null,
    };

    await playFromCatalog([normalized], 0);
  }
  const duration_seconds = Number(duration) % 60 || 0;
  const duration_minutes = Math.floor(Number(duration) / 60) || 0;
  const sheetRef = React.useRef<BottomSheetRef>(null);
  function handleSheetOpen() {
    sheetRef.current?.open();
  }

  return (
    <View style={{}}>
      {variant === "large" && (
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.largeContainer, cardStyle]}
          onPress={handlePress}
        >
          <Image
            style={styles.imageLarge}
            source={image as ImageSourcePropType}
          />
          <View style={{ gap: theme.sizes.spacing.sm }}>
            <Text size="sm" color={theme.colors.white[50]}>
              {title}
            </Text>
            <View style={styles.textContainer}>
              <Text size="xs" textStyle={{ alignItems: "center" }}>
                {minister}
              </Text>
              <View style={styles.dot} />
              <Text>
                {duration_minutes}:
                {duration_seconds.toString().padStart(2, "0")}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {variant === "small" && (
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.container, cardStyle]}
          onPress={handlePress}
        >
          <View style={styles.titleContainer}>
            <Image
              style={styles.imageSmall}
              source={resolvedImage}
            />
            <View style={{ gap: theme.sizes.spacing.sm, width: "60%" }}>
              <Text size="base" color={theme.colors.white[50]}>
                {title}
              </Text>
              <View style={styles.textContainer}>
                <Text textStyle={{ alignItems: "center" }}>{minister}</Text>
                <View style={styles.dot} />
                <Text>
                  {duration_minutes}:
                  {duration_seconds.toString().padStart(2, "0")}
                </Text>
              </View>
            </View>
          </View>
          <Pressable onPress={handleSheetOpen}>
            <SolidIcons.EllipsisVerticalIcon color={theme.colors.grey[50]} />
          </Pressable>
        </TouchableOpacity>
      )}
      <BottomSheetModal.Root ref={sheetRef}>
        <BottomSheetModal.Title>
          <View>
            <View style={styles.titleContainer}>
              <Image
                style={styles.imageSmall}
                source={resolvedImage}
              />
              <View style={{ gap: theme.sizes.spacing.sm, width: "60%" }}>
                <Text size="base" color={theme.colors.white[50]}>
                  {title}
                </Text>
                <View style={styles.textContainer}>
                  <Text textStyle={{ alignItems: "center" }}>{minister}</Text>
                  <View style={styles.dot} />
                  <Text>
                    {duration_minutes}:
                    {duration_seconds.toString().padStart(2, "0")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </BottomSheetModal.Title>
        <BottomSheetModal.Content>
          {TrackListActions.map((action, index) => (
            <Pressable
              key={index + "item"}
              style={{
                flexDirection: "row",
                gap: theme.sizes.spacing.md,
                paddingVertical: theme.sizes.spacing.md,
                alignItems: "center",
              }}
              onPress={() => {
                action.action?.();
                sheetRef.current?.close();
              }}
            >
              {action.icon}
              <Text color="white" size="sm">
                {action.label}
              </Text>
            </Pressable>
          ))}
        </BottomSheetModal.Content>
      </BottomSheetModal.Root>
    </View>
  );
};

export default TrackCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: theme.sizes.spacing.base,
    borderBottomWidth: 1,
    borderColor: theme.colors.grey[600],
    width: theme.sizes.screen.width * 0.8,
  },
  imageSmall: {
    height: 64,
    width: 64,
    borderRadius: theme.sizes.radius.sm,
  },
  titleContainer: {
    flexDirection: "row",
    gap: theme.sizes.spacing.md,
    alignItems: "center",
  },
  dot: {
    height: 4,
    width: 4,
    backgroundColor: theme.colors.grey[300],
    borderRadius: theme.sizes.radius.full,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.sizes.spacing.sm,
  },
  imageLarge: {
    width: "100%",
    height: theme.sizes.screen.height * 0.2,
    borderRadius: theme.sizes.radius.base,
  },
  largeContainer: {
    gap: theme.sizes.spacing.base,
  },
});


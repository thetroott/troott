import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import React from "react";
import Text from "@/components/ui/text";
import { theme } from "@/constants/theme";
import { SolidIcons } from "@/assets/icons";
import {
  BottomSheetModal,
  BottomSheetRef,
} from "@/components/ui/bottom-sheet-modal";
import { SermonTrackDTO } from "@/dtos/sermon.dto";
import { usePlayFromCatalog } from "@/engine/hooks/usePlayFromCatalog";
import { TrackListActions } from "./actions";

/** Props for display; full SermonTrackDTO required when triggering playback. */
export type TrackCardProps = Partial<Omit<SermonTrackDTO, "duration">> & {
  duration?: number | string;
  variant?: "small" | "large";
  cardStyle?: Record<string, unknown>;
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

  const resolvedImage = (artwork ?? image) as ImageSourcePropType;
  const playFromCatalog = usePlayFromCatalog("Library");

  async function handlePress() {
    const normalized = {
      id,
      url: url ?? (sermon as any) ?? undefined,
      title,
      artist: (data as any).artist ?? (data as any).minister,
      minister: (data as any).minister ?? (data as any).artist,
      duration,
      artwork: (data as any).artwork ?? (data as any).image,
      image: (data as any).image ?? (data as any).artwork,
    } as unknown as SermonTrackDTO;

    await playFromCatalog(normalized);
  }

  const durationSeconds = Number(duration) % 60 || 0;
  const durationMinutes = Math.floor(Number(duration) / 60) || 0;
  const sheetRef = React.useRef<BottomSheetRef>(null);

  const durationStr = `${durationMinutes}:${durationSeconds.toString().padStart(2, "0")}`;

  if (variant === "large") {
    return (
      <Pressable
        style={cardStyle}
        className="gap-4"
        onPress={handlePress}
      >
        <Image
          style={styles.imageLarge}
          source={image as ImageSourcePropType}
        />
        <View className="gap-2">
          <Text size="sm" className="text-neutral-100">
            {title}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text size="xs" className="text-neutral-400">
              {minister}
            </Text>
            <View className="h-1 w-1 rounded-full bg-neutral-500" />
            <Text className="text-neutral-400">{durationStr}</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <View>
      <Pressable
        style={cardStyle}
        className="flex-row items-center justify-between border-b border-neutral-600 pb-4"
        onPress={handlePress}
      >
        <View className="flex-row items-center gap-4">
          <Image style={styles.imageSmall} source={resolvedImage} />
          <View className="w-[60%] gap-2">
            <Text size="base" className="text-neutral-100">
              {title}
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-neutral-400">{minister}</Text>
              <View className="h-1 w-1 rounded-full bg-neutral-500" />
              <Text className="text-neutral-400">{durationStr}</Text>
            </View>
          </View>
        </View>
        <Pressable onPress={() => sheetRef.current?.open()}>
          <SolidIcons.EllipsisVerticalIcon color={theme.colors.grey[50]} />
        </Pressable>
      </Pressable>
      <BottomSheetModal.Root ref={sheetRef}>
        <BottomSheetModal.Title>
          <View className="flex-row items-center gap-4">
            <Image style={styles.imageSmall} source={resolvedImage} />
            <View className="w-[60%] gap-2">
              <Text size="base" className="text-neutral-100">
                {title}
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-neutral-400">{minister}</Text>
                <View className="h-1 w-1 rounded-full bg-neutral-500" />
                <Text className="text-neutral-400">{durationStr}</Text>
              </View>
            </View>
          </View>
        </BottomSheetModal.Title>
        <BottomSheetModal.Content>
          {TrackListActions.map((action, index) => (
            <Pressable
              key={index + "item"}
              className="flex-row items-center gap-4 py-4"
              onPress={() => {
                action.action?.();
                sheetRef.current?.close();
              }}
            >
              {action.icon}
              <Text className="text-neutral-100" size="sm">
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

// Allowed exception: image dimensions.
const styles = StyleSheet.create({
  imageSmall: {
    height: 64,
    width: 64,
    borderRadius: theme.sizes.radius.sm,
  },
  imageLarge: {
    width: "100%",
    height: theme.sizes.screen.height * 0.2,
    borderRadius: theme.sizes.radius.base,
  },
});

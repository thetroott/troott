import { Image, ImageSourcePropType, View, ViewStyle } from "react-native";
import React from "react";
import { IPlayListCard } from "./types";
import Text from "@/components/ui/text";
import TrackCard from "./track-card";
import { theme } from "@/constants/theme";
import Button from "@/components/ui/button";
import { SolidIcons } from "@/assets/icons";

const PlayList = ({
  title,
  description,
  coverImage,
  cardStyle,
  tracks,
  church,
}: IPlayListCard) => {
  return (
    <View style={cardStyle} className="gap-6 rounded-2xl bg-neutral-600 p-4">
      <View className="flex-row gap-4">
        <Image
          source={
            (coverImage as ImageSourcePropType) ??
            require("@/assets/images/cover.jpg")
          }
          className="h-24 w-24 rounded-2xl"
        />
        <View className="gap-2">
          <Text size="lg" weight="semiBold" className="text-neutral-100">
            {title}
          </Text>
          <Text className="text-neutral-400">{church}</Text>
          <Text className="text-neutral-400">{tracks?.length ?? 0} Messages</Text>
          <Button className="w-[70%] flex-row items-center justify-center gap-2 rounded-full bg-neutral-600 p-2">
            <SolidIcons.PlayIcon color={theme.colors.grey[50]} />
            <Text>Play All</Text>
          </Button>
        </View>
      </View>
      <Text className="text-neutral-400">{description}</Text>
      <View className="gap-1">
        {tracks?.map((item, index) => (
          <TrackCard
            key={index + "trending"}
            {...item}
            variant="small"
            cardStyle={{ width: "100%", borderBottomWidth: 0 }}
          />
        ))}
      </View>
    </View>
  );
};

export default PlayList;

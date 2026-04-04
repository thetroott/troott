import { View } from "react-native";
import React from "react";
import { OutlineIcons } from "@/assets/icons";
import { theme } from "@/constants/theme";
import { PlayListCardItem } from "@/components/containers/player-old";

interface PlaylistProps {
  isGrid: boolean;
}

const Playlists = ({ isGrid }: PlaylistProps) => {
  const cardWidth = isGrid ? theme.sizes.screen.width * 0.42 : "100%";
  return (
    <View>
      <PlayListCardItem
        icon={OutlineIcons.HeartIcon}
        title="Liked Sermons"
        description="Auto playlist - 6 sermons"
        id=""
        cardStyle={{ width: cardWidth }}
      />
      <PlayListCardItem
        title="My Playlists"
        description="2 playlists"
        image="https://picsum.photos/200/300"
        id=""
        variant={isGrid ? "large" : "small"}
        cardStyle={{ width: cardWidth }}
      />
      <PlayListCardItem
        title="My Playlists"
        description="2 playlists"
        image="https://picsum.photos/100/300"
        id=""
        variant={isGrid ? "large" : "small"}
        cardStyle={{ width: cardWidth }}
      />
    </View>
  );
};

export default Playlists;

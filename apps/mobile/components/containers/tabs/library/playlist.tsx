import { StyleSheet, Text, View } from "react-native";
import React from "react";

import { OutlineIcons } from "@/assets/icons";
import { theme } from "@/constants/theme";
import { PlayListCardItem } from "@/components/containers/player-old";

interface PlaylistProps {
  isGrid: boolean;
}

const Playlists = ({ isGrid }: PlaylistProps) => {
  return (
    <View>
      <PlayListCardItem
        icon={OutlineIcons.HeartIcon}
        title="Liked Sermons"
        description="Auto playlist - 6 sermons"
        id=""
        cardStyle={{
          width: isGrid ? theme.sizes.screen.width * 0.42 : "100%",
        }}
      />
      <PlayListCardItem
        title="My Playlists"
        description="2 playlists"
        image="https://picsum.photos/200/300"
        id=""
        variant={isGrid ? "large" : "small"}
        cardStyle={{
          width: isGrid ? theme.sizes.screen.width * 0.42 : "100%",
        }}
      />
      <PlayListCardItem
        title="My Playlists"
        description="2 playlists"
        image="https://picsum.photos/100/300"
        id=""
        variant={isGrid ? "large" : "small"}
        cardStyle={{
          width: isGrid ? theme.sizes.screen.width * 0.42 : "100%",
        }}
      />
    </View>
  );
};

export default Playlists;

const styles = StyleSheet.create({});

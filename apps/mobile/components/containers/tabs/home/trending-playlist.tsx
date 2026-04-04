import { View } from "react-native";
import React from "react";
import Text from "@/components/ui/text";
import PlayList from "@/components/containers/player-old/playlist";
import { tracks } from "@/_data/_mock/tracks";
import { useSermonsCatalogQuery } from "@/engine/hooks/useSermonsCatalogQuery";

const TrendingPlayList = () => {
  const { data: sermons, isLoading } = useSermonsCatalogQuery();

  const convertToPlaylistTracks = (sermonTracks: any[]) => {
    return (
      sermonTracks?.slice(0, 6).map((track) => ({
        id: track.id,
        title: track.title,
        minister: track.artist || track.minister,
        duration: track.duration,
        image: track.artwork || track.image,
        sermon: track.url || track.sermon,
        url: track.url || track.sermon,
      })) ?? []
    );
  };

  const dataSource = sermons && sermons.length > 0 ? sermons : tracks;

  if (isLoading && (!dataSource || dataSource.length === 0)) {
    return (
      <View className="gap-6">
        <Text size="md" className="text-neutral-100" weight="semiBold">
          Trending Playlist
        </Text>
        <Text className="py-5 text-center text-neutral-400">
          Loading playlists...
        </Text>
      </View>
    );
  }

  const trendingTracks = convertToPlaylistTracks(dataSource ?? []);
  const spiritualGrowthTracks = convertToPlaylistTracks(
    dataSource?.slice(3, 9) ?? []
  );

  return (
    <View className="gap-6">
      <Text size="md" className="text-neutral-100" weight="semiBold">
        Trending Playlist
      </Text>
      <PlayList
        title="Joy in the journey"
        church="Koinonia Minstry"
        tracks={trendingTracks}
        description="Ain't no journey like a faith journey. Soundtracking your spiritual growth with sermons that uplift!"
      />
      <PlayList
        title="Our heavenly home"
        church="Koinonia Minstry"
        tracks={spiritualGrowthTracks}
        description="The most streamed sermons and must hear messages"
        cardStyle={{ backgroundColor: "#2F1516" }}
      />
    </View>
  );
};

export default TrendingPlayList;

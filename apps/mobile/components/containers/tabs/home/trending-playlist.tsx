import { StyleSheet, View } from "react-native";
import React from "react";
import { theme } from "@/constants/theme";
import Text from "@/components/ui/text";
import PlayList from "@/components/containers/player-old/playlist";
import { useSermonsCatalog } from "@/engine/hooks/useSermonsCatalog";
import { ISermonTrack } from "@/dtos/sermon.dto";
import { tracks } from "@/_data/_mock/tracks";

const TrendingPlayList = () => {
  const { data: sermons, isLoading } = useSermonsCatalog();
  
  // Convert ISermonTrack to the format expected by PlayList component
  const convertToPlaylistTracks = (sermonTracks: any[]) => {
    return sermonTracks?.slice(0, 6).map(track => ({
      id: track.id,
      title: track.title,
      minister: track.artist || track.minister,
      duration: track.duration,
      image: track.artwork || track.image,
      sermon: track.url || track.sermon,
      url: track.url || track.sermon,
    })) || [];
  };
  
  // Use fallback data if sermons are not loaded
  const dataSource = sermons && sermons.length > 0 ? sermons : tracks;
  
  if (isLoading && (!dataSource || dataSource.length === 0)) {
    return (
      <View style={styles.container}>
        <Text size="md" color={theme.colors.white[50]} weight="semiBold">
          Trending Playlist
        </Text>
        <Text style={{ color: theme.colors.grey[300], textAlign: 'center', paddingVertical: 20 }}>
          Loading playlists...
        </Text>
      </View>
    );
  }

  const trendingTracks = convertToPlaylistTracks(dataSource || []);
  const spiritualGrowthTracks = convertToPlaylistTracks(dataSource?.slice(3, 9) || []);

  return (
    <View style={styles.container}>
      <Text size="md" color={theme.colors.white[50]} weight="semiBold">
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
        cardStyle={{
          backgroundColor: "#2F1516",
        }}
      />
    </View>
  );
};

export default TrendingPlayList;

const styles = StyleSheet.create({
  container: {
    gap: theme.sizes.spacing.lg,
  },
});

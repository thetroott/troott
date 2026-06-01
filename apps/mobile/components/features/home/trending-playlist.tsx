import { StyleSheet, View } from 'react-native';
import React from 'react';
import { theme } from '@/constants/theme';
import Text from '@/components/ui/text';
import PlayList from '@/components/features/playlist/playlist';
import { useDiscoveryHomeRails } from '@/engine/hooks/useDiscoveryHomeRails';

const TrendingPlayList = () => {
    const { mostPlayed, isLoading } = useDiscoveryHomeRails();

    if (isLoading && mostPlayed.length === 0) {
        return (
            <View style={styles.container}>
                <Text
                    size="md"
                    color={theme.colors.white[50]}
                    weight="semiBold"
                >
                    Trending Playlist
                </Text>
                <Text
                    style={{
                        color: theme.colors.grey[300],
                        textAlign: 'center',
                        paddingVertical: 20,
                    }}
                >
                    Loading playlists...
                </Text>
            </View>
        );
    }

    if (mostPlayed.length === 0) {
        return (
            <View style={styles.container}>
                <Text
                    size="md"
                    color={theme.colors.white[50]}
                    weight="semiBold"
                >
                    Trending Playlist
                </Text>
                <Text
                    style={{
                        color: theme.colors.grey[300],
                        textAlign: 'center',
                        paddingVertical: 20,
                    }}
                >
                    No trending sermons yet.
                </Text>
            </View>
        );
    }

    const trendingTracks = mostPlayed.slice(0, 6);
    const spiritualGrowthTracks = mostPlayed.slice(3, 9);
    const primaryTitle =
        trendingTracks[0]?.seriesTitle ??
        trendingTracks[0]?.title ??
        'Trending now';
    const primaryChurch = trendingTracks[0]?.minister ?? 'Troott';

    return (
        <View style={styles.container}>
            <Text size="md" color={theme.colors.white[50]} weight="semiBold">
                Trending Playlist
            </Text>
            <PlayList
                title={String(primaryTitle)}
                church={String(primaryChurch)}
                tracks={trendingTracks}
                description="Ain't no journey like a faith journey. Soundtracking your spiritual growth with sermons that uplift!"
            />
            <PlayList
                title="Most played this week"
                church={String(primaryChurch)}
                tracks={spiritualGrowthTracks.length > 0 ? spiritualGrowthTracks : trendingTracks}
                description="The most streamed sermons and must hear messages"
                cardStyle={{
                    backgroundColor: '#2F1516',
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

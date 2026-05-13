import { Pressable, StyleSheet, View } from 'react-native';
import React, { useMemo } from 'react';
import { router } from 'expo-router';

import PlaylistAddTrackContent from '@/components/features/playlist/playlist-add-track-content';
import { DEFAULT_CHOOSE_PLAYLISTS } from '@/components/features/playlist/use-add-to-playlist';
import ScreenModalAndroidView from '@/components/ui/screen-modal-android';
import { usePlaylistsQuery } from '@/hooks/use-library-queries';
import { mapPlaylistDocsToChooseItems } from '@/lib/playlists-map';
import { useCurrentTrack } from '@/stores/player/queue';
import { useContextType } from '@/state/app-state';

const UserPlayList = () => {
    const current = useCurrentTrack();
    const sermonTrackId =
        current?.item?.id != null
            ? String(current.item.id)
            : current?.id != null
              ? String(current.id)
              : null;

    const { userContext } = useContextType();
    const userId = (userContext.user as { id?: string } | null)?.id;
    const { data: playlistsRaw } = usePlaylistsQuery(!!userId);

    const sermonPlaylists = useMemo(() => {
        const mapped = mapPlaylistDocsToChooseItems(playlistsRaw);
        return mapped.filter(
            (p) => (p.playlistType ?? '').toLowerCase() === 'sermon',
        );
    }, [playlistsRaw]);

    const initialPlaylists = useMemo(() => {
        if (sermonPlaylists.length > 0) return sermonPlaylists;
        return sermonTrackId ? [] : DEFAULT_CHOOSE_PLAYLISTS;
    }, [sermonPlaylists, sermonTrackId]);

    return (
        <ScreenModalAndroidView>
            <View style={styles.root}>
                <Pressable
                    style={styles.backdrop}
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                />
                <View style={styles.foreground} pointerEvents="box-none">
                    <PlaylistAddTrackContent
                        initialPlaylists={initialPlaylists}
                        sermonTrackId={sermonTrackId}
                    />
                </View>
            </View>
        </ScreenModalAndroidView>
    );
};

export default UserPlayList;

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    foreground: {
        flex: 1,
        justifyContent: 'flex-end',
    },
});

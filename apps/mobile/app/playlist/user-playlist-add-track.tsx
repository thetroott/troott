import { Pressable, StyleSheet, View } from 'react-native';
import React, { useMemo } from 'react';
import { router } from 'expo-router';

import PlaylistAddTrackContent from '@/components/features/playlist/playlist-add-track-content';
import { DEFAULT_CHOOSE_PLAYLISTS } from '@/components/features/playlist/use-add-to-playlist';
import type { ChoosePlaylistListItem } from '@/components/features/playlist/playlist-choose-types';
import ScreenModalAndroidView from '@/components/ui/screen-modal-android';
import { usePlaylistsQuery } from '@/api/hooks/app/useLibrary';
import { useCurrentTrack } from '@/engine/state/player-queue-store';
import { useContextType } from '@/context';

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

    const sermonPlaylists = useMemo((): ChoosePlaylistListItem[] => {
        if (!Array.isArray(playlistsRaw)) {
            return [];
        }
        const out: ChoosePlaylistListItem[] = [];
        for (const row of playlistsRaw) {
            if (row == null || typeof row !== 'object') {
                continue;
            }
            const o = row as Record<string, unknown>;
            const id =
                o._id != null
                    ? String(o._id)
                    : o.id != null
                      ? String(o.id)
                      : '';
            const title =
                typeof o.title === 'string'
                    ? o.title
                    : typeof o.name === 'string'
                      ? o.name
                      : '';
            const playlistType =
                typeof o.playlistType === 'string' ? o.playlistType : undefined;
            if (!id || !title) {
                continue;
            }
            if ((playlistType ?? '').toLowerCase() !== 'sermon') {
                continue;
            }
            out.push({ id, title, playlistType });
        }
        return out;
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

import React from 'react';
import { router } from 'expo-router';

import type { ChoosePlaylistListItem } from './playlist-choose-types';

export const DEFAULT_CHOOSE_PLAYLISTS: ChoosePlaylistListItem[] = [
    { id: 'liked-by-you', title: 'Liked By You' },
    { id: 'soul-fuel', title: 'Soul Fuel' },
];

export const ADD_TO_PLAYLIST_TOAST_MS = 3500;

type ToastState = { playlistId: string; name: string } | null;

export type SermonAddedToPlaylistInfo = { playlistId: string; name: string };

export type UseAddToPlaylistStateOptions = {
    /**
     * When set, selection shows no inline confirmation; caller closes UI (e.g. a sheet) and
     * presents feedback at the source (e.g. the sermon card).
     */
    onSermonAdded?: (info: SermonAddedToPlaylistInfo) => void;
};

export function useAddToPlaylistState(
    options?: UseAddToPlaylistStateOptions,
) {
    const optsRef = React.useRef(options);
    optsRef.current = options;

    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [toast, setToast] = React.useState<ToastState>(null);

    React.useEffect(() => {
        if (!toast) {
            return;
        }
        const t = setTimeout(() => setToast(null), ADD_TO_PLAYLIST_TOAST_MS);
        return () => clearTimeout(t);
    }, [toast]);

    const handleSelect = React.useCallback(
        (id: string, sourceList: ChoosePlaylistListItem[] = DEFAULT_CHOOSE_PLAYLISTS) => {
            setSelectedId(id);
            const row = sourceList.find((p) => p.id === id);
            if (row) {
                const info: SermonAddedToPlaylistInfo = {
                    playlistId: row.id,
                    name: row.title,
                };
                if (optsRef.current?.onSermonAdded) {
                    optsRef.current.onSermonAdded(info);
                } else {
                    setToast(info);
                }
            }
        },
        [],
    );

    const handleViewPlaylist = React.useCallback(
        (playlistId: string) => {
            setToast(null);
            router.push(`/playlist/${playlistId}`);
        },
        [],
    );

    const reset = React.useCallback(() => {
        setSelectedId(null);
        setToast(null);
    }, []);

    return {
        selectedId,
        setSelectedId,
        toast,
        setToast,
        handleSelect,
        handleViewPlaylist,
        reset,
    };
}

import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';

import Toast from 'react-native-toast-message';

import { useAddSermonToPlaylistMutation } from '@/api/hooks/app/usePlaylist';

import AddToPlaylistConfirmationBar from './add-to-playlist-confirmation-bar';
import ChoosePlaylistSheet from './choose-playlist-sheet';
import type { ChoosePlaylistListItem } from './playlist-choose-types';
import { useAddToPlaylistState, type SermonAddedToPlaylistInfo } from './use-add-to-playlist';

export type PlaylistAddTrackContentRef = {
    reset: () => void;
};

type PlaylistAddTrackContentProps = {
    initialPlaylists: ChoosePlaylistListItem[];
    /** When set with `playlistType` on rows, persists via PATCH before confirmation UI. */
    sermonTrackId?: string | null;
    /**
     * When true, the choose list is nested in a bottom sheet (e.g. over full player).
     */
    chooseEmbeddedInBottomSheet?: boolean;
    /** e.g. dismiss a bottom sheet before `router.push` to the playlist (inline confirmation only). */
    onBeforeViewPlaylist?: () => void;
    /**
     * When set, no in-flow confirmation; parent closes the sheet and shows "sermon added" at the
     * trigger (e.g. `SermonCard`).
     */
    onSermonAddedToPlaylist?: (info: SermonAddedToPlaylistInfo) => void;
};

const PlaylistAddTrackContent = forwardRef<
    PlaylistAddTrackContentRef,
    PlaylistAddTrackContentProps
>(function PlaylistAddTrackContent(
    {
        initialPlaylists,
        sermonTrackId = null,
        chooseEmbeddedInBottomSheet = false,
        onBeforeViewPlaylist,
        onSermonAddedToPlaylist,
    },
    ref,
) {
    const addToPlaylist = useAddSermonToPlaylistMutation();

    const { selectedId, toast, handleSelect, handleViewPlaylist, reset: resetState } =
        useAddToPlaylistState(
            onSermonAddedToPlaylist
                ? { onSermonAdded: onSermonAddedToPlaylist }
                : undefined,
        );

    const [listItems, setListItems] = useState(initialPlaylists);

    const initialRef = useRef(initialPlaylists);
    initialRef.current = initialPlaylists;

    useEffect(() => {
        setListItems(initialPlaylists);
    }, [initialPlaylists]);

    const reset = useCallback(() => {
        resetState();
        setListItems([...initialRef.current]);
    }, [resetState]);

    useImperativeHandle(ref, () => ({ reset }), [reset]);

    const onPickPlaylist = useCallback(
        async (id: string) => {
            const row = listItems.find((p) => p.id === id);
            if (sermonTrackId && row) {
                const playlistItemType = row.playlistType?.trim();
                if (!playlistItemType) {
                    Toast.show({
                        text1: 'Cannot add sermon',
                        text2: 'This playlist is missing a type. Try another playlist.',
                        type: 'error',
                    });
                    return;
                }
                try {
                    await addToPlaylist.mutateAsync({
                        playlistId: id,
                        sermonId: sermonTrackId,
                    });
                } catch (e) {
                    const msg =
                        e instanceof Error ? e.message : 'Could not add to playlist';
                    Toast.show({
                        text1: 'Save failed',
                        text2: msg,
                        type: 'error',
                    });
                    return;
                }
            }
            handleSelect(id, listItems);
        },
        [addToPlaylist, handleSelect, listItems, sermonTrackId],
    );

    return (
        <View>
            {toast ? (
                <View style={styles.toastSlot}>
                    <AddToPlaylistConfirmationBar
                        playlistName={toast.name}
                        onView={() => {
                            onBeforeViewPlaylist?.();
                            handleViewPlaylist(toast.playlistId);
                        }}
                    />
                </View>
            ) : null}
            <ChoosePlaylistSheet
                embeddedInBottomSheet={chooseEmbeddedInBottomSheet}
                playlists={listItems}
                selectedId={selectedId}
                onSelect={onPickPlaylist}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    toastSlot: {
        marginBottom: theme.sizes.spacing.sm,
    },
});

export default PlaylistAddTrackContent;

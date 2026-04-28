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

import AddToPlaylistConfirmationBar from './add-to-playlist-confirmation-bar';
import ChoosePlaylistSheet from './choose-playlist-sheet';
import type { ChoosePlaylistListItem } from './playlist-choose-types';
import { useAddToPlaylistState, type SermonAddedToPlaylistInfo } from './use-add-to-playlist';

export type PlaylistAddTrackContentRef = {
    reset: () => void;
};

type PlaylistAddTrackContentProps = {
    initialPlaylists: ChoosePlaylistListItem[];
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
        chooseEmbeddedInBottomSheet = false,
        onBeforeViewPlaylist,
        onSermonAddedToPlaylist,
    },
    ref,
) {
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
                onSelect={(id) => handleSelect(id, listItems)}
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

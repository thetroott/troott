import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomSheetModal, type BottomSheetRef } from '@/components/ui/bottom-sheet-modal';
import { theme } from '@/constants/theme';

import PlaylistAddTrackContent, {
    type PlaylistAddTrackContentRef,
} from './playlist-add-track-content';
import type { ChoosePlaylistListItem } from './playlist-choose-types';
import {
    DEFAULT_CHOOSE_PLAYLISTS,
    type SermonAddedToPlaylistInfo,
} from './use-add-to-playlist';

export type AddToPlaylistBottomSheetProps = {
    /** Defaults to demo playlists; replace with API data when available. */
    playlists?: ChoosePlaylistListItem[];
    /** Stacked on top of another bottom sheet. */
    zIndex?: number;
    portalName?: string;
    /**
     * When set, the sheet closes after save and the caller shows confirmation at the origin
     * (e.g. the sermon list row) instead of inside the sheet.
     */
    onSermonAddedToPlaylist?: (info: SermonAddedToPlaylistInfo) => void;
};

/**
 * "Save to playlist" as a second bottom sheet, stacked above the track actions sheet
 * (see sermon-card). "New playlist" in the list routes to the create-playlist screen.
 */
const AddToPlaylistBottomSheet = forwardRef<
    BottomSheetRef,
    AddToPlaylistBottomSheetProps
>(function AddToPlaylistBottomSheet(
    {
        playlists = DEFAULT_CHOOSE_PLAYLISTS,
        zIndex = 20,
        portalName: portalNameProp,
        onSermonAddedToPlaylist,
    },
    forwardedRef,
) {
    const localRef = useRef<BottomSheetRef | null>(null);
    const flowRef = useRef<PlaylistAddTrackContentRef | null>(null);

    const generatedPortal = `add-to-playlist-${React.useId().replace(/:/g, '')}`;

    useImperativeHandle(
        forwardedRef,
        () => ({
            open: () => {
                flowRef.current?.reset();
                localRef.current?.open();
            },
            close: () => {
                localRef.current?.close();
            },
        }),
        [],
    );

    return (
        <BottomSheetModal.Root
            ref={localRef}
            zIndex={zIndex}
            portalName={portalNameProp ?? generatedPortal}
        >
            <View style={styles.flow}>
                <PlaylistAddTrackContent
                    ref={flowRef}
                    initialPlaylists={playlists}
                    chooseEmbeddedInBottomSheet
                    onSermonAddedToPlaylist={onSermonAddedToPlaylist}
                    onBeforeViewPlaylist={() => {
                        localRef.current?.close();
                    }}
                />
            </View>
        </BottomSheetModal.Root>
    );
});

const styles = StyleSheet.create({
    flow: {
        minHeight: theme.sizes.screen.height * 0.4,
    },
});

export default AddToPlaylistBottomSheet;

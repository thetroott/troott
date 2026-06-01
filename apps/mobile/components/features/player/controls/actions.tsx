import { theme } from '@/constants/theme';
import { SaveToPlaylistIcon } from '@/components/features/shared/Icons';
import { router } from 'expo-router';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';
import type { ReactNode } from 'react';
import {
    DocumentDownload,
    Heart,
    MusicFilter,
    Next,
    Profile,
    Send2,
} from 'iconsax-react-nativejs';
import Toast from 'react-native-toast-message';
import { openShareFlow } from '@/lib/state/share-flow';

export type GetTrackListActionsOptions = {
    /**
     * When set (e.g. from a bottom sheet), opens add-to-playlist in a stacked sheet
     * instead of navigating to the modal route.
     */
    onOpenAddToPlaylist?: () => void;
    onLike?: () => void;
    onAddPlayNext?: () => void;
    onAddToQueue?: () => void;
    onViewMinister?: () => void;
    /** Offline download intent — wire storage pipeline when available. */
    onDownload?: () => void;
};

export type TrackListAction = {
    icon: ReactNode;
    label: string;
    action: () => void;
};

export const getTrackListActions = (
    track?: SermonItemDTO,
    options?: GetTrackListActionsOptions,
): TrackListAction[] => [
    {
        icon: <Heart color={theme.colors.grey[50]} />,
        label: 'Like',
        action: () => {
            options?.onLike?.();
        },
    },
    {
        icon: <SaveToPlaylistIcon color={theme.colors.grey[50]} />,
        label: 'Save to playlist',
        action: () => {
            if (options?.onOpenAddToPlaylist) {
                options.onOpenAddToPlaylist();
            } else {
                router.push('/playlist/user-playlist-add-track');
            }
        },
    },
    {
        icon: <Next color={theme.colors.grey[50]} />,
        label: 'Add to play next',
        action: () => {
            options?.onAddPlayNext?.();
        },
    },
    {
        icon: <MusicFilter color={theme.colors.grey[50]} />,
        label: 'Add to queue',
        action: () => {
            options?.onAddToQueue?.();
        },
    },
    {
        icon: <DocumentDownload color={theme.colors.grey[50]} />,
        label: 'Download',
        action: () => {
            if (options?.onDownload) {
                options.onDownload();
            } else {
                Toast.show({
                    text1: 'Downloads',
                    text2: 'Offline downloads are not available on this build yet.',
                    type: 'info',
                });
            }
        },
    },
    {
        icon: <Send2 color={theme.colors.grey[50]} />,
        label: 'Share',
        action: () => {
            openShareFlow({
                id: track?.id ?? null,
                title: track?.title ?? 'Beauty For Ashes',
                minister: track?.minister ?? 'Unknown minister',
                image: track?.image ?? null,
                artwork: track?.artwork ?? null,
                shareableUrl: track?.shareableUrl ?? null,
            });
        },
    },
    {
        icon: <Profile color={theme.colors.grey[50]} />,
        label: 'View Minister',
        action: () => {
            options?.onViewMinister?.();
        },
    },
    // {
    //     icon: <Warning2 color={theme.colors.grey[50]} />,
    //     label: 'Report',
    //     action: () => {},
    // }, 
    // {
    //     icon: <Timer1 color={theme.colors.grey[50]} />,
    //     label: 'Sleep Timer',
    //     action: () => {},
    // },
];

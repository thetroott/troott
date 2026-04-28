import { theme } from '@/constants/theme';
import { SaveToPlaylistIcon } from '@/components/features/shared/Icons';
import { router } from 'expo-router';
import type { SermonItemDTO } from '@/types/sermon';
import type { ReactNode } from 'react';
import {
    DocumentDownload,
    Heart,
    MusicFilter,
    Next,
    Profile,
    Send2,
} from 'iconsax-react-nativejs';
import { openShareFlow } from '@/stores/app/share';

export type GetTrackListActionsOptions = {
    /**
     * When set (e.g. from a bottom sheet), opens add-to-playlist in a stacked sheet
     * instead of navigating to the modal route.
     */
    onOpenAddToPlaylist?: () => void;
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
        action: () => {},
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
        action: () => {},
    },
    {
        icon: <MusicFilter color={theme.colors.grey[50]} />,
        label: 'Add to queue',
        action: () => {},
    },
    {
        icon: <DocumentDownload color={theme.colors.grey[50]} />,
        label: 'Download',
        action: () => {},
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
            });
        },
    },
    {
        icon: <Profile color={theme.colors.grey[50]} />,
        label: 'View Minister',
        action: () => {},
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

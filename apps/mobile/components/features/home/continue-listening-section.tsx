import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import SermonCard from '@/components/features/search/sermon-card';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import { useRecentPlaybackQuery } from '@/api/hooks/app/usePlayback';
import { useLastPlayed } from '@/engine/state/player-queue-store';
import { lastPlayedToSermonItemDto } from '@/engine/state/last-played-sync';
import { useResumeLastPlayed } from '@/engine/playback/use-resume-last-played';
import { SolidIcons } from '@/assets/icons';
import {
    playbackRowToLastPlayed,
    playbackRowToSermonItem,
    pickNewerLastPlayed,
} from '@/engine/utils/playback-map';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';

/**
 * Home rail from local last-played and/or server GET /playback (feat-0015).
 */
export default function ContinueListeningSection() {
    const lastPlayed = useLastPlayed();
    const { data: recentPlayback } = useRecentPlaybackQuery();
    const resumeLastPlayed = useResumeLastPlayed();

    const serverLastPlayed = useMemo(() => {
        const row = recentPlayback?.[0];
        if (!row) {
            return null;
        }
        return playbackRowToLastPlayed(row);
    }, [recentPlayback]);

    const effectiveLastPlayed = useMemo(
        () => pickNewerLastPlayed(lastPlayed, serverLastPlayed),
        [lastPlayed, serverLastPlayed],
    );

    const track = useMemo((): SermonItemDTO | null => {
        if (effectiveLastPlayed?.sermonId && effectiveLastPlayed.streamUrl) {
            return lastPlayedToSermonItemDto(effectiveLastPlayed);
        }
        const row = recentPlayback?.[0];
        if (!row) {
            return null;
        }
        return playbackRowToSermonItem(row);
    }, [effectiveLastPlayed, recentPlayback]);

    if (!track?.id) {
        return null;
    }

    const progressSource = effectiveLastPlayed ?? serverLastPlayed;
    const progressPct =
        progressSource && progressSource.durationSec > 0
            ? Math.min(
                  100,
                  Math.max(
                      0,
                      (progressSource.lastPositionSec /
                          progressSource.durationSec) *
                          100,
                  ),
              )
            : 0;

    return (
        <View style={styles.section}>
            <Text
                size="md"
                weight="semiBold"
                color={theme.colors.white[100]}
            >
                Continue listening
            </Text>
            <SermonCard
                track={track}
                index={0}
                tracklist={[track]}
                queue="Recently Played"
                variant="small"
            />
            <View style={styles.progressTrack}>
                <View
                    style={[styles.progressFill, { width: `${progressPct}%` }]}
                />
            </View>
            <Pressable
                style={styles.resumeButton}
                onPress={() => void resumeLastPlayed()}
                accessibilityRole="button"
                accessibilityLabel="Resume playback"
            >
                <SolidIcons.PlayIcon
                    size={20}
                    color={theme.colors.black[100]}
                />
                <Text size="sm" weight="medium" color={theme.colors.black[100]}>
                    Resume
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: theme.sizes.spacing.sm,
    },
    progressTrack: {
        height: 2,
        backgroundColor: theme.colors.grey[600],
        borderRadius: theme.sizes.radius.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: 2,
        backgroundColor: theme.colors.teal[500],
        borderRadius: theme.sizes.radius.full,
    },
    resumeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: theme.sizes.spacing.xs,
        paddingHorizontal: theme.sizes.spacing.base,
        paddingVertical: theme.sizes.spacing.sm,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: theme.colors.teal[500],
    },
});

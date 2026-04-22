import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Next, Previous, Repeat, Shuffle } from 'iconsax-react-nativejs';
import Slider from '@react-native-community/slider';

import Text from '@/components/ui/text';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { SolidIcons } from '@/assets/icons';
import { usePlaybackControls } from '@/components/features/player/hooks/use-playback-controls';

export function TrackProgress() {
    const {
        shuffle,
        repeatActive,
        trackPlaying,
        canSkipNext,
        durationUi,
        positionUi,
        formattedPosition,
        formattedDuration,
        onToggleRepeat,
        onToggleShuffle,
        onSeekComplete,
        onPrevious,
        onNext,
        onTogglePlay,
    } = usePlaybackControls({ source: 'full_player' });

    return (
        <View style={styles.progressContainer}>
            <Slider
                minimumValue={0}
                maximumValue={durationUi}
                value={positionUi}
                minimumTrackTintColor={colors.teal[500]}
                maximumTrackTintColor={theme.colors.grey[400]}
                onSlidingComplete={onSeekComplete}
            />

            <View style={styles.timeContainer}>
                <Text>{formattedPosition}</Text>
                <Text>{formattedDuration}</Text>
            </View>

            <View style={styles.controlsContainer}>
                <Pressable onPress={onToggleShuffle} accessibilityLabel="Shuffle">
                    <Shuffle
                        color={shuffle ? colors.teal[500] : theme.colors.white[50]}
                    />
                </Pressable>

                <View style={styles.playbackButtons}>
                    <Pressable onPress={onPrevious} accessibilityLabel="Previous Track">
                        <Previous color={theme.colors.white[50]} variant="Bold" />
                    </Pressable>

                    <Pressable
                        style={styles.playBtn}
                        onPress={onTogglePlay}
                        accessibilityLabel={trackPlaying ? 'Pause' : 'Play'}
                    >
                        {trackPlaying ? (
                            <SolidIcons.PauseIcon
                                color={theme.colors.black[50]}
                                size={28}
                            />
                        ) : (
                            <SolidIcons.PlayIcon
                                color={theme.colors.black[50]}
                                size={28}
                            />
                        )}
                    </Pressable>

                    <Pressable
                        onPress={onNext}
                        disabled={!canSkipNext}
                        style={!canSkipNext ? styles.controlDisabled : undefined}
                        accessibilityLabel="Next Track"
                    >
                        <Next color={theme.colors.white[50]} variant="Bold" />
                    </Pressable>
                </View>

                <Pressable onPress={onToggleRepeat} accessibilityLabel="Repeat">
                    <Repeat
                        color={
                            repeatActive ? colors.teal[500] : theme.colors.white[50]
                        }
                    />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    progressContainer: { gap: theme.sizes.spacing.sm },
    timeContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    playbackButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.xl,
    },
    playBtn: {
        backgroundColor: theme.colors.white[50],
        padding: theme.sizes.spacing.md,
        borderRadius: theme.sizes.radius.full,
    },
    controlDisabled: { opacity: 0.35 },
});

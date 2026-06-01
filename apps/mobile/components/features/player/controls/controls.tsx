import Icon from '@/components/features/player/player/icon';
import PlayPauseButton from '@/components/features/player/controls/play-pause';
import {
    usePrevious,
    useSkip,
    useToggleRepeatMode,
    useToggleShuffle,
} from '@/engine/hooks/useControl';
import { useRepeatModeStoreValue, useShuffle } from '@/engine/state/player-queue-store';
import React from 'react';
import { View } from 'react-native';
import { RepeatMode } from '@rntp/player';

export default function Controls() {
    const previous = usePrevious();
    const skip = useSkip();

    const repeatMode = useRepeatModeStoreValue();
    const toggleRepeatMode = useToggleRepeatMode();

    const shuffled = useShuffle();
    const { mutate: toggleShuffle } = useToggleShuffle();

    return (
        <View className="flex-row items-center justify-between w-full">
            {/* Shuffle */}
            <Icon
                small
                name="shuffle"
                color={shuffled ? '#3B82F6' : '#ccc'}
                onPress={() => toggleShuffle(shuffled)}
            />

            <View className="flex-1" />

            {/* Previous */}
            <Icon
                large
                name="skip-previous"
                color="#3B82F6"
                onPress={previous}
                testID="previous-button-test-id"
            />

            {/* Big Play / Pause Button */}
            <PlayPauseButton size={38} />

            {/* Next */}
            <Icon
                large
                name="skip-next"
                color="#3B82F6"
                onPress={() => skip(undefined)}
                testID="skip-button-test-id"
            />

            <View className="flex-1" />

            {/* Repeat */}
            <Icon
                small
                name={repeatMode === RepeatMode.One ? 'repeat-once' : 'repeat'}
                color={repeatMode === RepeatMode.Off ? '#ccc' : '#3B82F6'}
                onPress={() => toggleRepeatMode()}
            />
        </View>
    );
}

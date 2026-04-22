import { OutlineIcons, SolidIcons } from '@/assets/icons';
import { usePlaybackState } from '@/engine/queries/playback-queries';
import { useTogglePlayback } from '@/engine/hooks/useControl';
import { isUndefined } from 'lodash';
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { UiPlaybackState } from '@/engine/constants/playback-ui';

function PlayPauseButtonComponent({
    size,
    flex,
}: {
    size?: number | undefined;
    flex?: number | undefined;
}): React.JSX.Element {
    const togglePlayback = useTogglePlayback();

    const state = usePlaybackState();

    const largeIcon = useMemo(() => isUndefined(size) || size >= 20, [size]);

    const button = useMemo(() => {
        switch (state) {
            case UiPlaybackState.Playing: {
                return (
                    <Pressable onPress={togglePlayback}>
                        <SolidIcons.PauseIcon
                            width={size}
                            height={size}
                            color="white"
                        />
                    </Pressable>
                );
            }

            case UiPlaybackState.Buffering:
            case UiPlaybackState.Loading: {
                return <ActivityIndicator size="small" color="white" />;
            }

            default: {
                return (
                    <Pressable onPress={togglePlayback}>
                        <OutlineIcons.PlayIcon
                            width={size}
                            height={size}
                            color="white"
                        />
                    </Pressable>
                );
            }
        }
    }, [state, size, largeIcon, togglePlayback]);

    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', flex }}>
            {button}
        </View>
    );
}

const PlayPauseButton = React.memo(PlayPauseButtonComponent);

export default PlayPauseButton;

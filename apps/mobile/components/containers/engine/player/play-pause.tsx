import { OutlineIcons, SolidIcons } from '@/assets/icons'
import { usePlaybackState } from '@/engine/queries/playback-queries'
import { useTogglePlayback } from '@/engine/hooks/useControl'
import { isUndefined } from 'lodash'
import React, { useMemo } from 'react'
import { Pressable, View } from 'react-native'
import { ActivityIndicator } from 'react-native'
import { State } from 'react-native-track-player'


function PlayPauseButtonComponent({
    size,
    flex,
}: {
    size?: number | undefined
    flex?: number | undefined
}): React.JSX.Element {

    const togglePlayback = useTogglePlayback()

    const state = usePlaybackState()

    const largeIcon = useMemo(() => isUndefined(size) || size >= 20, [size])

    console.log('state', state)

    const button = useMemo(() => {
        switch (state) {
            case State.Playing: {
                return (

                    <Pressable onPress={togglePlayback}>
                        <SolidIcons.PauseIcon
                            width={size}
                            height={size}
                            color="white"
                        />
                    </Pressable>

                )
            }

            case State.Buffering:
            case State.Loading: {
                return <ActivityIndicator size="small" color="white" />
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

                )
            }
        }
    }, [state, size, largeIcon, togglePlayback])


    return (
    <View
      className="items-center justify-center"
      style={flex !== undefined ? { flex } : undefined}
    >
      {button}
    </View>
  )
}

const PlayPauseButton = React.memo(PlayPauseButtonComponent)

export default PlayPauseButton

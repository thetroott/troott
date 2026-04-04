import { MINIPLAYER_UPDATE_INTERVAL } from "@/engine/constants/engine";
import { useProgress } from "@/engine/queries/playback-queries";
import { usePrevious, useSkip } from "@/engine/hooks/useControl";
import { RunTimeSeconds } from "@/engine/helpers/time-codes";
import { useCurrentTrack } from "@/stores/player/queue";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut, runOnJS, useSharedValue, withSpring } from "react-native-reanimated";
import { Progress as TrackPlayerProgress } from 'react-native-track-player'
import { Slider } from "@/components/ui/slider";
import { Image, View } from "react-native";
import { StyleSheet } from "react-native";
import TextTicker from "react-native-text-ticker";
import PlayPauseButton from "../containers/engine/player/play-pause";
import { Pressable } from "react-native";



const MiniPlayer = () => {

    const nowPlaying = useCurrentTrack()
    const skip = useSkip()
    const previous = usePrevious()
    //const favourites = useFavourites()
    const router = useRouter()

    const translateX = useSharedValue(0)
    const translateY = useSharedValue(0)

    const handleSwipe = useCallback(

        (direction: string) => {

            if (direction === 'Swiped Left') {
                skip(undefined)
            } else if (direction === 'Swiped Right') {
                previous()
            } else if (direction === 'Swiped Up') {
                router.push('/player')
            }
        },
        [skip, previous, router]
    )

    const gesture = useMemo(
        () =>
            Gesture.Pan()
                .onUpdate((event) => {
                    translateX.value = event.translationX
                    translateY.value = event.translationY
                })
                .onEnd((event) => {
                    const threshold = 100
                    if (event.translationX > threshold) {
                        runOnJS(handleSwipe)('Swiped Right')
                        translateX.value = withSpring(200)
                    } else if (event.translationX < -threshold) {
                        runOnJS(handleSwipe)('Swiped Left')
                        translateX.value = withSpring(-200)
                    } else if (event.translationY < -threshold) {
                        runOnJS(handleSwipe)('Swiped Up')
                        translateY.value = withSpring(-200)
                    } else {
                        translateX.value = withSpring(0)
                        translateY.value = withSpring(0)
                    }
                }),
        [translateX, translateY, handleSwipe]
    )


    const openPlayer = useCallback(() => {
        router.push('/player')
    }, [router])


    return (
        <>
            <GestureDetector gesture={gesture}>

                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    className="absolute bottom-0 w-full flex-row items-center bg-neutral-900 p-2"
                >

                    <Pressable onPress={openPlayer} className="flex-row items-center p-2" />

                    <Animated.View entering={FadeIn} exiting={FadeOut}>
                        <Image
                            source={{ uri: nowPlaying?.item?.image ?? '' }}
                            className="w-12 h-12 rounded"
                        />
                    </Animated.View>

                    {/* Song Info */}
                    <View className="flex-1">
                        <MiniPlayerRuntime duration={nowPlaying?.duration ?? 0} />
                        <TextTicker
                            duration={5000}
                            loop
                            bounce
                            repeatSpacer={50}
                            marqueeDelay={1000}
                            className="font-bold text-neutral-100"
                        >
                            {nowPlaying?.title}
                        </TextTicker>
                        <TextTicker
                            duration={5000}
                            loop
                            bounce
                            repeatSpacer={50}
                            marqueeDelay={1000}
                            className="text-xs text-neutral-500"
                        >
                            {nowPlaying?.artist}
                        </TextTicker>
                    </View>

                    <MiniPlayerProgress />


                    {/* Play/Pause */}
                    <View className="flex-row items-center justify-end ml-2">
                        <PlayPauseButton size={48} />
                    </View>


                </Animated.View>
            </GestureDetector>

        </>
    )


}


function calculateProgressPercentage(progress: TrackPlayerProgress | undefined): number {
    return Math.round((progress!.position / progress!.duration) * 100)
}


function MiniPlayerRuntimePosition(): React.JSX.Element {
    const { position } = useProgress(MINIPLAYER_UPDATE_INTERVAL)
    return <RunTimeSeconds alignment="left">{Math.max(0, Math.floor(position))}</RunTimeSeconds>
}


function MiniPlayerRuntime({ duration }: { duration: number }) {
    return (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            className="flex-row items-center gap-1 h-4"
        >
            {/* current position */}
            <View className="justify-center mr-2 pr-auto">
                <MiniPlayerRuntimePosition />
            </View>

            {/* separator */}
            <View className="text-center text-gray-400">/</View>

            {/* duration */}
            <View className="justify-center ml-2">
                <RunTimeSeconds alignment="right" className="text-neutral-500">
                    {Math.max(0, Math.floor(duration))}
                </RunTimeSeconds>
            </View>
        </Animated.View>
    );
}



function MiniPlayerProgress(): React.JSX.Element {
  const progress = useProgress(MINIPLAYER_UPDATE_INTERVAL);

  return (
    <View className="absolute bottom-[70px] left-0 right-0 flex-row items-center justify-between bg-neutral-600 p-2.5">
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={progress.duration}
        value={calculateProgressPercentage(progress)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slider: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
  },
});



export default MiniPlayer;
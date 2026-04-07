// import Icon from '../Global/components/icon'
// import Track from '../Global/components/track'
// import { RootStackParamList } from '../../screens/types'
// import { NativeStackNavigationProp } from '@react-navigation/native-stack'
// import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist'
// import { Separator, XStack } from 'tamagui'
// import { isUndefined } from 'lodash'
// import { useLayoutEffect, useCallback, useMemo } from 'react'
// import SermonTrackDTO from '../../types/SermonTrackDTO'
// import {
// 	useRemoveFromQueue,
// 	useRemoveUpcomingTracks,
// 	useReorderQueue,
// 	useSkip,
// } from '../../providers/Player/hooks/mutations'
// import useHapticFeedback from '../../hooks/use-haptic-feedback'
// import { useCurrentTrack, usePlayQueue, useQueueRef } from '../../stores/player/queue'

import { SermonTrackDTO } from "@/dtos/sermon.dto";
import {
    useRemoveFromQueue,
    useRemoveUpcomingTracks,
    useReorderQueue, useSkip
} from "@/engine/hooks/useControl"
import useHapticFeedback from "@/hooks/shared/use-haptic-feedback"
import { useCurrentTrack, usePlayQueue, useQueueRef } from "@/stores/player/queue"
import { useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useMemo } from "react";
import { Separator } from "../ui/separator";
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist'
import { isUndefined } from "lodash";
import { Pressable } from "react-native";
import SermonTrack from "../containers/engine/player/single-sermon";


const Queue = (): React.JSX.Element => {

    const router = useRouter();

    const nowPlaying = useCurrentTrack()
    const playQueue = usePlayQueue()
    const queueRef = useQueueRef()

    const { mutate: removeUpcomingTracks } = useRemoveUpcomingTracks()
    const { mutate: removeFromQueue } = useRemoveFromQueue()
    const { mutate: reorderQueue } = useReorderQueue()
    
    const skip = useSkip()
    const trigger = useHapticFeedback()

    	// Header Right with NativeWind styling
	useLayoutEffect(() => {
		// In Expo Router, you can customize header buttons via layout options if needed
		// Or implement a custom header inside your screen
	}, []);
    // useLayoutEffect(() => {
    //     navigation.setOptions({
    //         headerRight: () => {
    //             return <Icon name='notification-clear-all' onPress={removeUpcomingTracks} />
    //         },
    //     })
    // }, [navigation, removeUpcomingTracks])

    // Memoize scroll index calculation
    const scrollIndex = useMemo(
        () => playQueue?.findIndex((queueItem) => queueItem.item.id! === nowPlaying!.item.id!),
        [playQueue, nowPlaying?.item.id],
    )

    // Memoize key extractor for better performance
    const keyExtractor = useCallback(
        (item: SermonTrackDTO, index: number) => `${index}-${item.item.id}`,
        [],
    )

    // Memoize getItemLayout for better performance
    const getItemLayout = useCallback(
        (data: ArrayLike<SermonTrackDTO> | null | undefined, index: number) => ({
            length: 20,
            offset: (20 / 9) * index,
            index,
        }),
        [],
    )

    // Memoize ItemSeparatorComponent to prevent recreation
    const ItemSeparatorComponent = useCallback(() =>  <Separator className="bg-gray-200 h-px" />, [])

    // Memoize onDragEnd handler
    const handleDragEnd = useCallback(
        ({ from, to }: { from: number; to: number }) => {
            reorderQueue({ from, to })
        },
        [reorderQueue],
    )

    // Memoize renderItem function for better performance
    const renderItem = useCallback(
        ({ item: queueItem, getIndex, drag, isActive }: RenderItemParams<SermonTrackDTO>) => {
            const index = getIndex()

            const handleLongPress = () => {
                trigger('impactLight')
                drag()
            }

            const handlePress = () => {
                if (!isUndefined(index)) skip(index)
            }

            const handleRemove = () => {
                if (!isUndefined(index)) removeFromQueue(index)
            }

            return (
				<Pressable
					onPress={handlePress}
					onLongPress={handleLongPress}
					className={`flex-row items-center px-4 py-2 ${isActive ? 'opacity-70' : ''}`}
				>
					<SermonTrack
						queue={queueRef ?? 'Recently Played'}
						track={queueItem.item}
						index={index ?? 0}
						showArtwork
						onPress={handlePress}
						onLongPress={handleLongPress}
						isNested
						showRemove
						onRemove={handleRemove}
					/>
				</Pressable>
			);
		},
		[queueRef, skip, removeFromQueue, trigger]
	);


    return (
        <DraggableFlatList
            contentInsetAdjustmentBehavior='automatic'
            data={playQueue ?? []}
            dragHitSlop={{
                left: -50, // https://github.com/computerjazz/react-native-draggable-flatlist/issues/336
            }}
            extraData={nowPlaying?.item.id} // Only track the playing track ID, not the entire object
            getItemLayout={getItemLayout}
            initialScrollIndex={scrollIndex !== -1 ? scrollIndex : 0}
            ItemSeparatorComponent={ItemSeparatorComponent}
            keyExtractor={keyExtractor}
            numColumns={1}
            onDragEnd={handleDragEnd}
            renderItem={renderItem}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            updateCellsBatchingPeriod={50}
        />
    )
}


export default Queue
import { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { BaseSermonDtoSlimified, SermonItemDTO } from '@/dtos/sermon.dto';
import { Queue } from '@/engine/types/type';
import { useCurrentTrack, usePlayQueue } from '@/stores/player/queue';
import { useAddToQueue, useLoadNewQueue } from '@/engine/hooks/useControl';
import { useNetworkStatus } from '@/stores/app/network';
import { networkStatusTypes } from '../../shared/network-watcehr';
import { QueuingType } from '@/utils/enums.util';
import SwipeableRow from './SwipeableRow';
import { RunTimeTicks } from '@/engine/helpers/time-codes';
import { useSwipeableRowContext } from './swipeable-row-context';
import { SolidIcons } from '@/assets/icons';
import { XMarkIcon } from 'react-native-heroicons/solid';
import { NotificationCircle, NotificationFavorite } from 'iconsax-react-nativejs';
// import { ArrowRight, X, DotsThreeVertical } from 'phosphor-react-native'; // SolidIcons alternative

// import { RunTimeTicks } from '../helpers/time-codes';
// import ItemImage from './image';
// import SwipeableRow from './SwipeableRow';
// import FavoriteIcon from './favorite-icon';
// import DownloadedIcon from './downloaded-icon';
// import { useSwipeableRowContext } from './swipeable-row-context';
// import { buildSwipeConfig } from '../helpers/swipe-actions';
// import { useAddToQueue, useLoadNewQueue } from '../../../providers/Player/hooks/mutations';
// import { useCurrentTrack, usePlayQueue } from '../../../stores/player/queue';
// import { useAddFavorite, useRemoveFavorite } from '../../../api/mutations/favorite';
// import { useStreamedMediaInfo } from '../../../api/queries/media';
// import { useDownloadedTrack } from '../../../api/queries/download';
// import { useIsFavorite } from '../../../api/queries/user-data';
// import { useNetworkStatus } from '../../../stores/network';
// import { networkStatusTypes } from '../../../components/Network/internetConnectionWatcher';
// import { QueuingType } from '../../../enums/queuing-type';

export interface ISermon {
  track: SermonItemDTO; // BaseItemDto
  tracklist?: BaseSermonDtoSlimified[];
  index: number;
  queue: Queue;
  showArtwork?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  isNested?: boolean;
  invertedColors?: boolean;
  prependElement?: React.ReactNode;
  showRemove?: boolean;
  onRemove?: () => void;
  testID?: string;
}

export default function SermonTrack(data: ISermon) {

    const {
        track,
        tracklist,
        index,
        queue,
        showArtwork,
        onPress,
        onLongPress,
        testID,
        isNested,
        prependElement,
        showRemove,
        onRemove,
      } = data

  const router = useRouter();
  const [artworkWidth, setArtworkWidth] = useState(0);

  const nowPlaying = useCurrentTrack();
  const playQueue = usePlayQueue();
  const loadNewQueue = useLoadNewQueue();
  const addToQueue = useAddToQueue();
  const [networkStatus] = useNetworkStatus();
  //const offlineAudio = useDownloadedTrack(track.Id);
  //const { data: mediaInfo } = useStreamedMediaInfo(track.Id);

//   const { mutate: addFavorite } = useAddFavorite();
//   const { mutate: removeFavorite } = useRemoveFavorite();
//   const { data: isFavoriteTrack } = useIsFavorite(track);

  const isPlaying = useMemo(() => nowPlaying?.item.id === track.id, [nowPlaying?.item.id, track.id]);
  const isOffline = useMemo(() => networkStatus === networkStatusTypes.DISCONNECTED, [networkStatus]);
  const memoizedTracklist = useMemo(() => tracklist ?? playQueue?.map((t) => t.item) ?? [], [tracklist, playQueue]);

  const handlePress = useCallback(() => {
    if (onPress) return onPress();
    loadNewQueue({
      track,
      index,
      tracklist: memoizedTracklist,
      queue,
      queuingType: QueuingType.FromSelection,
      startPlayback: true,
    });
  }, [onPress, track, index, memoizedTracklist, queue]);

  const handleLongPress = useCallback(() => {
    if (onLongPress) return onLongPress();
    router.push({
      pathname: '/context',
      params: {
        itemId: track.id,
        // streamingInfo: mediaInfo?.MediaSources?.[0],
        // downloadedInfo: offlineAudio?.mediaSourceInfo,
      },
    });
  }, [onLongPress, track]);

  const handleIconPress = useCallback(() => {
    if (showRemove && onRemove) return onRemove();
    router.push({
      pathname: '/context',
      params: {
        itemId: track.id,
        // streamingInfo: mediaInfo?.MediaSources?.[0],
        // downloadedInfo: offlineAudio?.mediaSourceInfo,
      },
    });
  }, [showRemove, onRemove, track, mediaInfo?.MediaSources, offlineAudio]);

  const textColorClass = useMemo(() => {
    if (isPlaying) return "text-teal-500";
    if (isOffline) return "text-neutral-500";
    return "text-neutral-100";
  }, [isPlaying, isOffline]);

  const artistsText = useMemo(() => track.minister?.join(', ') ?? '', [track.minister]);
  const trackName = useMemo(() => track.title ?? 'Untitled', [track.title]);
  const indexNumber = useMemo(() => track.id?.toString() ?? '', [track.id]);
  const shouldShowArtists = useMemo(() => showArtwork || (track.minister && track.minister.length > 1), [showArtwork, track.minister]);

  // Swipe handlers
  const swipeHandlers = useMemo(() => ({
    addToQueue: async () => {
      await addToQueue({ tracks: [track], queuingType: QueuingType.DirectlyQueued });
    },
    toggleFavorite: () => {
      if (isFavoriteTrack) removeFavorite({ item: track });
      else addFavorite({ item: track });
    },
    addToPlaylist: () => router.push({ pathname: '/add-to-playlist', params: { trackId: track.Id } }),
  }), [addToQueue, track, addFavorite, removeFavorite, isFavoriteTrack, router]);

  const swipeConfig = useMemo(() => buildSwipeConfig({ left: {}, right: {}, handlers: swipeHandlers }), [swipeHandlers]);

  const runtimeComponent = useMemo(
    () => (
      <RunTimeTicks className="min-w-[40px] text-right">
        {track.duration}
      </RunTimeTicks>
    ),
    [track.duration]
  );

  return (
    <SwipeableRow disabled={isNested} {...swipeConfig} onPress={handlePress} onLongPress={handleLongPress}>
      <View className="flex-row items-center bg-neutral-900 p-2" testID={testID}>
        {prependElement && <View className="mr-2">{prependElement}</View>}

        <View
          className="mx-2 items-center justify-center"
          onLayout={(e: LayoutChangeEvent) => setArtworkWidth(e.nativeEvent.layout.width)}
        >
          {showArtwork ? (
            <HideableArtwork>
              <ItemImage item={track} width={48} height={48} />
            </HideableArtwork>
          ) : (
            <Text className={`w-12 text-center ${textColorClass}`}>{indexNumber}</Text>
          )}
        </View>

        <SlidingTextArea leftGapWidth={artworkWidth} hasArtwork={!!showArtwork}>
          <View className="flex-1 justify-center">
            <Text className={`font-bold ${textColorClass} truncate`}>{trackName}</Text>
            {shouldShowArtists && (
            <Text className="truncate text-neutral-500">{artistsText}</Text>
          )}
          </View>
        </SlidingTextArea>

        <View className="flex-row items-center ml-2 space-x-1">
          <SolidIcons.ChevronUpDownIcon item={track} />
          <NotificationCircle item={track} />
          {runtimeComponent}
          <Pressable onPress={handleIconPress}>
            {showRemove ? <XMarkIcon size={20} /> : <SolidIcons.CreditCardIcon size={20} />}
          </Pressable>
        </View>
      </View>
    </SwipeableRow>
  );
}

function HideableArtwork({ children }: { children: React.ReactNode }) {
  const { tx } = useSwipeableRowContext();
  const style = useAnimatedStyle(() => ({ opacity: tx.value === 0 ? 1 : 0 }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

function SlidingTextArea({ leftGapWidth, hasArtwork, children }: { leftGapWidth: number; hasArtwork: boolean; children: React.ReactNode }) {
  const { tx, rightWidth } = useSwipeableRowContext();
  const style = useAnimatedStyle(() => {
    const t = tx.value;
    let offset = 0;
    if (t > 0 && hasArtwork) offset = -Math.min(t, Math.max(0, leftGapWidth));
    else if (t < 0) offset = Math.min(-t, Math.max(0, rightWidth)) * 0.7;
    return { transform: [{ translateX: offset }] };
  });
  return (
    <Animated.View className="flex-1" style={style}>
      {children}
    </Animated.View>
  );
}

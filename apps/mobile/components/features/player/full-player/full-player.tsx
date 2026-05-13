import { usePrevious, useSkip } from '@/engine/hooks/useControl';
import useHapticFeedback from '@/api/hooks/shared/use-haptic-feedback';
import { useCurrentTrack } from '@/stores/player/queue';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FullPlayer = () => {
    const [showToast, setShowToast] = useState(true);

    const nowPlaying = useCurrentTrack();
    const skip = useSkip();
    const previous = usePrevious();
    const trigger = useHapticFeedback();

    const { width, height } = useWindowDimensions();
    const { top, bottom } = useSafeAreaInsets();

    // Animation state
    const translateX = useSharedValue(0);

    // Opacity for swipe icons
    const leftIconStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(
                Math.max(0, -translateX.value),
                [0, 40, 120],
                [0, 0.25, 1],
            ),
        };
    });

    const rightIconStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(
                Math.max(0, translateX.value),
                [0, 40, 120],
                [0, 0.25, 1],
            ),
        };
    });

    // Swipe gesture
    const swipeGesture = useMemo(() => {
        return Gesture.Pan()
            .runOnJS(true)
            .activeOffsetX([-12, 12])
            .onUpdate((e) => {
                if (Math.abs(e.translationY) < 40) {
                    translateX.value = Math.max(
                        -160,
                        Math.min(160, e.translationX),
                    );
                }
            })
            .onEnd((e) => {
                const threshold = 120;
                const minVelocity = 600;
                const isHorizontal = Math.abs(e.translationY) < 40;

                if (
                    isHorizontal &&
                    (Math.abs(e.translationX) > threshold ||
                        Math.abs(e.velocityX) > minVelocity)
                ) {
                    if (e.translationX > 0) {
                        translateX.value = withSpring(220);
                        trigger('notificationSuccess');
                        void previous();
                    } else {
                        translateX.value = withSpring(-220);
                        trigger('notificationSuccess');
                        void skip(undefined);
                    }

                    translateX.value = withDelay(160, withSpring(0));
                } else {
                    translateX.value = withSpring(0);
                }
            });
    }, [previous, skip, trigger]);

    // Container padding based on platform safe area
    const mainContainerStyle = {
        marginTop: Platform.OS === 'android' ? top : 16,
        marginBottom: bottom * 2,
    };

    // Handle toast
    useFocusEffect(
        useCallback(() => {
            setShowToast(true);
            return () => setShowToast(false);
        }, []),
    );
};

export default FullPlayer;

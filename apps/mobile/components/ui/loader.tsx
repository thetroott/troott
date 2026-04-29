import { StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { theme } from '@/constants/theme';

const DOT_COUNT = 3;

/**
 * One pulsing dot. Hooks must live here — not inside `.map()` on the parent
 * (violates Rules of Hooks and can break Reanimated after Expo / RN upgrades).
 *
 * Do not add `transformOrigin` (or other Fabric-only style props that are not
 * worklet-safe) inside `useAnimatedStyle`; see
 * https://github.com/software-mansion/react-native-reanimated/issues/8739
 */
function LoaderDot({ staggerMs }: { staggerMs: number }) {
    const loaderProgress = useSharedValue(0);

    const loaderStyle = useAnimatedStyle(() => ({
        opacity: interpolate(loaderProgress.value, [0, 1], [0.7, 1]),
        width: theme.sizes.spacing.sm,
        height: theme.sizes.spacing.sm,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: theme.colors.grey[300],
        transform: [
            {
                scale: interpolate(loaderProgress.value, [0, 1], [0.7, 1]),
            },
        ],
    }));

    useEffect(() => {
        const id = setTimeout(() => {
            loaderProgress.value = withRepeat(
                withTiming(1, { duration: 400 }),
                -1,
                true,
            );
        }, staggerMs);
        return () => clearTimeout(id);
    }, [loaderProgress, staggerMs]);

    return <Animated.View style={loaderStyle} />;
}

const Loader = () => {
    return (
        <View style={styles.container}>
            {Array.from({ length: DOT_COUNT }, (_, index) => (
                <LoaderDot key={index} staggerMs={index * 120} />
            ))}
        </View>
    );
};

export default Loader;

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

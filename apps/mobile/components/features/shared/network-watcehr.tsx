import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';

import Text from '@/components/ui/text';
import { useNetworkStatus } from '@/lib/state/network-store';
import { sizes } from '@/constants/sizes';
import { colors } from '@/constants/colors';
import { networkStatusTypes } from '@/api/dtos/network.dto';

const internetConnectionWatcher = {
    NO_INTERNET: 'You are offline',
    BACK_ONLINE: "And we're back!",
};

export { networkStatusTypes };

/** Expanded banner height (replaces Tamagui token `$8`). */
const BANNER_OPEN_HEIGHT = sizes.spacing.xl + sizes.spacing.md;

/**
 * Offline / back-online banner driven by {@link useNetworkStatus} (updated from root via
 * {@link initNetworkStoreSync} and `@/lib/state/network-store`).
 */
const InternetConnectionWatcher = () => {
    
    const [networkStatus] = useNetworkStatus();

    const bannerHeight = useSharedValue(0);
    const opacity = useSharedValue(0);

    const animateBannerIn = () => {
        bannerHeight.value = withTiming(BANNER_OPEN_HEIGHT, {
            duration: 300,
            easing: Easing.out(Easing.ease),
        });
        opacity.value = withTiming(1, { duration: 300 });
    };

    const animateBannerOut = () => {
        bannerHeight.value = withTiming(0, {
            duration: 300,
            easing: Easing.in(Easing.ease),
        });
        opacity.value = withTiming(0, { duration: 200 });
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: bannerHeight.value,
            opacity: opacity.value,
        };
    });

    useEffect(() => {
        if (networkStatus === networkStatusTypes.DISCONNECTED) {
            animateBannerIn();
        } else if (networkStatus === networkStatusTypes.ONLINE) {
            animateBannerIn();
            setTimeout(() => {
                animateBannerOut();
            }, 2800);
        } else if (networkStatus === null) {
            animateBannerOut();
        }
    }, [networkStatus]);

    const bgColor =
        networkStatus === networkStatusTypes.ONLINE
            ? colors.teal[600]
            : colors.red[500];

    return (
        <Animated.View style={[{ overflow: 'hidden' }, animatedStyle]}>
            <View
                style={{
                    minHeight: sizes.spacing.lg,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: bgColor,
                    paddingVertical: sizes.spacing.xs,
                    paddingHorizontal: sizes.spacing.sm,
                }}
            >
                <Text
                    size="sm"
                    weight="medium"
                    style={{ textAlign: 'center', color: colors.white[50] }}
                >
                    {networkStatus === networkStatusTypes.DISCONNECTED
                        ? internetConnectionWatcher.NO_INTERNET
                        : networkStatus === networkStatusTypes.ONLINE
                          ? internetConnectionWatcher.BACK_ONLINE
                          : ''}
                </Text>
            </View>
        </Animated.View>
    );
};

export default InternetConnectionWatcher;

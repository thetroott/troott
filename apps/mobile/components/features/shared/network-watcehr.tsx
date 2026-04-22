import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';

import Text from '@/components/ui/text';
import { useNetworkStatus } from '@/stores/app/network';
import { sizes } from '@/constants/sizes';
import { colors } from '@/constants/colors';
import { networkStatusTypes } from '@/types/network-status';

const internetConnectionWatcher = {
    NO_INTERNET: 'You are offline',
    BACK_ONLINE: "And we're back!",
};

export { networkStatusTypes };

const isAndroid = Platform.OS === 'android';

/** Expanded banner height (replaces Tamagui token `$8`). */
const BANNER_OPEN_HEIGHT = sizes.spacing.xl + sizes.spacing.md;

const InternetConnectionWatcher = () => {
    const lastNetworkStatus = useRef<networkStatusTypes | null>(
        networkStatusTypes.ONLINE,
    );
    const [networkStatus, setNetworkStatus] = useNetworkStatus();

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

    const changeNetworkStatus = () => {
        if (lastNetworkStatus.current !== networkStatusTypes.DISCONNECTED) {
            setNetworkStatus(null);
        }
    };

    const internetConnectionBack = () => {
        setNetworkStatus(networkStatusTypes.ONLINE);
        setTimeout(() => {
            changeNetworkStatus();
        }, 3000);
    };

    useEffect(() => {
        lastNetworkStatus.current = networkStatus;
    }, [networkStatus]);

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

    useEffect(() => {
        const networkWatcherListener = NetInfo.addEventListener(
            ({ isConnected, isInternetReachable }) => {
                const isNetworkDisconnected = !(
                    isConnected && (isAndroid ? isInternetReachable : true)
                );

                if (isNetworkDisconnected) {
                    setNetworkStatus(networkStatusTypes.DISCONNECTED);
                } else if (
                    !isNetworkDisconnected &&
                    lastNetworkStatus.current ===
                        networkStatusTypes.DISCONNECTED
                ) {
                    internetConnectionBack();
                }
            },
        );
        return () => {
            networkWatcherListener();
        };
    }, []);

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
                    {networkStatus === networkStatusTypes.ONLINE
                        ? internetConnectionWatcher.BACK_ONLINE
                        : internetConnectionWatcher.NO_INTERNET}
                </Text>
            </View>
        </Animated.View>
    );
};

export default InternetConnectionWatcher;

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Switch from '@rn-primitives/switch';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import ScreenView from '@/components/ui/screenview';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import {
    useInAppNotificationsSetting,
    usePushNotificationsSetting,
} from '@/lib/preferences/app';
import { toast } from '@/components/ui/toast';

function NotificationToggle({
    label,
    description,
    value,
    onChange,
}: {
    label: string;
    description: string;
    value: boolean;
    onChange: (next: boolean) => void;
}) {
    const translateProgress = useSharedValue(value ? 1 : 0);

    useEffect(() => {
        translateProgress.value = value ? withTiming(1) : withTiming(0);
    }, [value, translateProgress]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: interpolate(
                    translateProgress.value,
                    [0, 1],
                    [0, 26],
                ),
            },
        ],
    }));

    return (
        <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
                <Text size="base" weight="medium" color={theme.colors.white[50]}>
                    {label}
                </Text>
                <Text size="sm" color={theme.colors.grey[400]}>
                    {description}
                </Text>
            </View>
            <Switch.Root
                checked={value}
                onCheckedChange={(v) => onChange(Boolean(v))}
                style={styles.switchRoot}
                accessibilityRole="switch"
                accessibilityState={{ checked: value }}
            >
                <Animated.View style={animatedStyle}>
                    <Switch.Thumb style={styles.switchThumb} />
                </Animated.View>
            </Switch.Root>
        </View>
    );
}

export default function NotificationsRoute() {
    const [pushEnabled, setPushEnabled] = usePushNotificationsSetting();
    const [inAppEnabled, setInAppEnabled] = useInAppNotificationsSetting();

    const handlePushToggle = async (next: boolean) => {
        if (next) {
            const current = await Notifications.getPermissionsAsync();
            const alreadyGranted =
                current.granted || current.status === 'granted';
            const requested = alreadyGranted
                ? current
                : await Notifications.requestPermissionsAsync();
            const granted =
                requested.granted || requested.status === 'granted';
            if (!granted) {
                toast.error(
                    'Push permission was not granted. Enable notifications in Settings to receive alerts.',
                );
                return;
            }
        }
        setPushEnabled(next);
    };

    return (
        <ScreenView>
            <View style={styles.topBar}>
                <Pressable
                    style={styles.backBtn}
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <ArrowLeft2 size={18} color={theme.colors.white[50]} />
                </Pressable>
            </View>
            <Text
                weight="semiBold"
                size="xl"
                color={theme.colors.white[50]}
                style={styles.title}
            >
                Notifications
            </Text>
            <Text size="sm" color={theme.colors.grey[400]} style={styles.subtitle}>
                Choose how Troott keeps you updated. Push permission is requested
                when you enable alerts on this device.
            </Text>

            <View style={styles.section}>
                <NotificationToggle
                    label="Push notifications"
                    description="New sermons, releases, and activity from ministers you follow."
                    value={pushEnabled}
                    onChange={(next) => {
                        void handlePushToggle(next);
                    }}
                />
                <NotificationToggle
                    label="In-app notifications"
                    description="Show updates inside Troott while you are listening."
                    value={inAppEnabled}
                    onChange={setInAppEnabled}
                />
            </View>
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    topBar: {
        marginBottom: theme.sizes.spacing.lg,
    },
    backBtn: {
        alignSelf: 'flex-start',
        padding: theme.sizes.spacing.sm,
        marginLeft: -theme.sizes.spacing.sm,
    },
    title: {
        marginBottom: theme.sizes.spacing.sm,
    },
    subtitle: {
        marginBottom: theme.sizes.spacing.lg,
    },
    section: {
        gap: theme.sizes.spacing.lg,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.sizes.spacing.md,
    },
    toggleCopy: {
        flex: 1,
        gap: theme.sizes.spacing.xs,
    },
    switchRoot: {
        borderRadius: theme.sizes.radius.full,
        backgroundColor: theme.colors.grey[600],
        width: 56,
        padding: 2,
    },
    switchThumb: {
        width: theme.sizes.spacing.lg + 4,
        height: theme.sizes.spacing.lg + 4,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: '#ffffff',
    },
});

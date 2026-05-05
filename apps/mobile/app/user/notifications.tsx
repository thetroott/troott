import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { router } from 'expo-router';

import ScreenView from '@/components/ui/screenview';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

export default function NotificationsRoute() {
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
            <Text size="sm" color={theme.colors.grey[400]}>
                No notifications yet. When you get updates, they will appear
                here.
            </Text>
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
});

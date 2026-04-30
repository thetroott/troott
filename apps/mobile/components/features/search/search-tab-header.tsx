import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
    Notification,
    ProfileCircle,
} from 'iconsax-react-nativejs';
import { router } from 'expo-router';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

export default function SearchTabHeader() {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.textContainer}>
                <Pressable
                    style={styles.profileTap}
                    onPress={() => router.push('/profile')}
                    accessibilityRole="button"
                    accessibilityLabel="Open profile"
                    hitSlop={8}
                >
                    <ProfileCircle color={theme.colors.white[100]} size={16} />
                </Pressable>
                <Text
                    size="md"
                    color={theme.colors.white[100]}
                    weight="semiBold"
                    textStyle={styles.titleText}
                >
                    Search
                </Text>
            </View>
            <Pressable
                onPress={() => router.push('/user/notifications')}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                hitSlop={8}
            >
                <Notification color={theme.colors.white[50]} variant="Bold" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.sizes.spacing.md,
    },
    textContainer: {
        flexDirection: 'row',
        gap: theme.sizes.spacing.sm,
        alignItems: 'center',
    },
    profileTap: {
        backgroundColor: '#7676803D',
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.sizes.radius.full,
    },
    titleText: {
        lineHeight: 27,
    },
});

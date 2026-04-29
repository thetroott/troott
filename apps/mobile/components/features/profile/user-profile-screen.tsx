import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { ArrowRight2 } from 'iconsax-react-nativejs';
import { router } from 'expo-router';

import ScreenView from '@/components/ui/screenview';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import ProfileSection from './profile-section';
import type { ProfileMenuItem } from './types';
import { useProfileIdentity } from './use-profile-identity';

const menuItems: ProfileMenuItem[] = [
    { id: 'account', label: 'Account' },
    { id: 'subscription', label: 'Manage subscription' },
    { id: 'recap', label: 'Your Recap' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'help-feedback', label: 'Help and feedback' },
    { id: 'about', label: 'About Troott' },
];

export default function UserProfileScreen() {
    const { displayName, avatarSource } = useProfileIdentity();

    return (
        <ScreenView screenStyle={styles.screen}>
            <View style={styles.statusBarGap} />
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.push('/user')}
                    style={styles.profileTrigger}
                >
                    <View style={styles.avatarWrap}>
                        <Image source={avatarSource} style={styles.avatar} />
                    </View>
                    <Text size="md" weight="semiBold" color={theme.colors.white[50]}>
                        {displayName}
                    </Text>
                </Pressable>
            </View>

            <View style={styles.menuWrap}>
                <ProfileSection items={menuItems} />
            </View>

            <Pressable
                style={styles.highlightRow}
                onPress={() => router.push('/user/about-troott')}
            >
                <View style={styles.highlightLeft}>
                    <Text
                        size="sm"
                        weight="medium"
                        color={theme.colors.teal[500]}
                    >
                        About Troott
                    </Text>
                </View>
                <ArrowRight2 size={16} color={theme.colors.white[50]} />
            </Pressable>

        </ScreenView>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: theme.colors.black[50],
        paddingHorizontal: 0,
        gap: 0,
    },
    statusBarGap: {
        height: 24,
    },
    header: {
        height: 64,
        backgroundColor: theme.colors.grey[800],
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.grey[700],
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.sm,
        paddingHorizontal: theme.sizes.spacing.base,
    },
    profileTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.sm,
    },
    menuWrap: {
        marginTop: theme.sizes.spacing.lg,
        paddingHorizontal: theme.sizes.spacing.base,
    },
    avatarWrap: {
        width: 32,
        height: 32,
        borderRadius: theme.sizes.radius.full,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: theme.sizes.radius.full,
    },
    highlightRow: {
        marginTop: theme.sizes.spacing.lg,
        height: 68,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.colors.grey[700],
        backgroundColor: theme.colors.grey[800],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.sizes.spacing.base,
    },
    highlightLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.sm,
    },
    highlightAvatarWrap: {
        width: 32,
        height: 32,
        borderRadius: theme.sizes.radius.full,
        overflow: 'hidden',
    },
    highlightAvatar: {
        width: 32,
        height: 32,
        borderRadius: theme.sizes.radius.full,
    }
});

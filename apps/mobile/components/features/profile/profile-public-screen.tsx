import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft2, More, Edit2, Send2 } from 'iconsax-react-nativejs';
import { router } from 'expo-router';

import Text from '@/components/ui/text';
import ScreenView from '@/components/ui/screenview';
import { theme } from '@/constants/theme';
import type { ProfilePlaylistItem } from './types';
import ProfilePlaylistRow from './profile-playlist-row';
import { useProfileIdentity } from './use-profile-identity';

const cover = require('@/assets/images/cover4.jpg');

type ProfilePublicScreenProps = {
    showPlaylists?: boolean;
};

const playlistItems: ProfilePlaylistItem[] = [
    {
        id: 'p-1',
        title: 'Hope from Despair',
        category: 'Playlist',
        author: 'Tobe Innocent',
        metric: '5 views',
        image: require('@/assets/images/1.jpg'),
    },
    {
        id: 'p-2',
        title: 'Grace Amid Trials',
        category: 'Playlist',
        author: 'Tobe Innocent',
        metric: '58:30',
        image: require('@/assets/images/2.jpg'),
    },
    {
        id: 'p-3',
        title: 'Strength in adversity.',
        category: 'Playlist',
        author: 'Joshua Selman',
        metric: '58:30',
        image: require('@/assets/images/3.jpg'),
    },
];

export default function ProfilePublicScreen({
    showPlaylists = true,
}: ProfilePublicScreenProps) {
    const { displayName, avatarSource } = useProfileIdentity();

    return (
        <ScreenView screenStyle={styles.screen}>
            <View style={styles.topBar}>
                <Pressable style={styles.topIcon} onPress={() => router.back()}>
                    <ArrowLeft2 size={18} color={theme.colors.white[50]} />
                </Pressable>
                <Pressable style={styles.topIcon}>
                    <More size={18} color={theme.colors.white[50]} />
                </Pressable>
            </View>

            <Image source={cover} style={styles.coverImage} />

            <Pressable
                style={styles.infoWrap}
                onPress={() => router.push('/user/edit-profile')}
            >
                <View style={styles.avatarRing}>
                    <Image source={avatarSource} style={styles.avatar} />
                </View>
                <Text size="md" weight="semiBold" color={theme.colors.white[50]}>
                    {displayName}
                </Text>
                <Text size="sm" color={theme.colors.grey[100]}>
                    0 Followers - 3 Following
                </Text>
                <View style={styles.actions}>
                    <Pressable
                        style={styles.actionIcon}
                        onPress={() => router.push('/user/edit-profile')}
                    >
                        <Edit2 size={20} color={theme.colors.white[50]} />
                    </Pressable>
                    <Pressable
                        style={styles.actionIcon}
                        onPress={() => router.push('/user/edit-profile')}
                    >
                        <Send2 size={20} color={theme.colors.white[50]} />
                    </Pressable>
                </View>
            </Pressable>

            {showPlaylists ? (
                <ProfilePlaylistRow items={playlistItems} />
            ) : (
                <View style={styles.emptyWrap}>
                    <Text size="xl" weight="bold" color={theme.colors.white[50]}>
                        No recent activity
                    </Text>
                </View>
            )}
            <ScrollView />
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: theme.colors.black[50],
        paddingHorizontal: 0,
        gap: 0,
    },
    topBar: {
        zIndex: 2,
        paddingTop: 8,
        paddingHorizontal: theme.sizes.spacing.base,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topIcon: {
        width: 32,
        height: 32,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: 'rgba(84,84,84,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    coverImage: {
        marginTop: -16,
        width: '100%',
        height: 128,
    },
    infoWrap: {
        marginTop: -48,
        paddingHorizontal: theme.sizes.spacing.base,
        gap: theme.sizes.spacing.sm,
    },
    avatarRing: {
        width: 94,
        height: 94,
        borderRadius: theme.sizes.radius.full,
        borderWidth: 2,
        borderColor: theme.colors.teal[500],
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: theme.sizes.radius.full,
    },
    actions: {
        marginTop: 2,
        flexDirection: 'row',
        gap: theme.sizes.spacing.sm,
    },
    actionIcon: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyWrap: {
        marginTop: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

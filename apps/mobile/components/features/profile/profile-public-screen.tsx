import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft2, More, Edit2, Send2 } from 'iconsax-react-nativejs';
import { router } from 'expo-router';

import Text from '@/components/ui/text';
import ScreenView from '@/components/ui/screenview';
import Loader from '@/components/ui/loader';
import { theme } from '@/constants/theme';
import ProfilePlaylistRow from './profile-playlist-row';
import { useProfileIdentity } from './use-profile-identity';
import { useProfilePlaylists } from './use-profile-playlists';
import { openShareFlow } from '@/lib/state/share-flow';

const cover = require('@/assets/images/cover4.jpg');

type ProfilePublicScreenProps = {
    showPlaylists?: boolean;
};

export default function ProfilePublicScreen({
    showPlaylists = true,
}: ProfilePublicScreenProps) {
    const { displayName, avatarSource, firstName } = useProfileIdentity();
    const { items: playlistItems, isLoading, isError, refetch } =
        useProfilePlaylists();

    const handleShareProfile = () => {
        openShareFlow({
            id: null,
            title: `${displayName} on Troott`,
            minister: displayName,
            image:
                typeof avatarSource === 'object' && avatarSource != null && 'uri' in avatarSource
                    ? String(avatarSource.uri)
                    : null,
            artwork: null,
        });
    };

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
                onPress={() => router.push('/user/photo-picker')}
            >
                <View style={styles.avatarRing}>
                    <Image source={avatarSource} style={styles.avatar} />
                </View>
                <Text size="md" weight="semiBold" color={theme.colors.white[50]}>
                    {displayName}
                </Text>
                <Text size="sm" color={theme.colors.grey[100]}>
                    Hi, {firstName}
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
                        onPress={handleShareProfile}
                    >
                        <Send2 size={20} color={theme.colors.white[50]} />
                    </Pressable>
                </View>
            </Pressable>

            {showPlaylists ? (
                isLoading && playlistItems.length === 0 ? (
                    <View style={styles.loadingWrap}>
                        <Loader tone="brand" />
                    </View>
                ) : isError && playlistItems.length === 0 ? (
                    <View style={styles.emptyWrap}>
                        <Text size="sm" color={theme.colors.grey[300]}>
                            Could not load playlists.
                        </Text>
                        <Pressable onPress={() => void refetch()}>
                            <Text size="sm" color={theme.colors.teal[400]}>
                                Retry
                            </Text>
                        </Pressable>
                    </View>
                ) : playlistItems.length > 0 ? (
                    <ProfilePlaylistRow
                        items={playlistItems}
                        onSeeMore={() => router.push('/library')}
                    />
                ) : (
                    <View style={styles.emptyWrap}>
                        <Text size="xl" weight="bold" color={theme.colors.white[50]}>
                            No playlists yet
                        </Text>
                        <Pressable onPress={() => router.push('/playlist/create-playlist')}>
                            <Text size="sm" color={theme.colors.teal[400]}>
                                Create a playlist
                            </Text>
                        </Pressable>
                    </View>
                )
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
    loadingWrap: {
        marginTop: 40,
        alignItems: 'center',
    },
    emptyWrap: {
        marginTop: 60,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.sizes.spacing.sm,
        paddingHorizontal: theme.sizes.spacing.lg,
    },
});

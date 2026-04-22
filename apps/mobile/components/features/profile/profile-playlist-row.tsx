import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ArrowRight2, Edit2, Send2 } from 'iconsax-react-nativejs';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { ProfilePlaylistItem } from './types';
import ProfilePlaylistCard from './profile-playlist-card';

type ProfilePlaylistRowProps = {
    title?: string;
    subtitle?: string;
    items: ProfilePlaylistItem[];
    onSeeMore?: () => void;
    showActionIcons?: boolean;
};

export default function ProfilePlaylistRow({
    title = 'Playlists',
    subtitle = 'Your playlists',
    items,
    onSeeMore,
    showActionIcons = false,
}: ProfilePlaylistRowProps) {
    return (
        <View style={styles.wrap}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    {subtitle ? (
                        <Text size="sm" weight="medium" color={theme.colors.grey[200]} style={{ marginBottom: theme.sizes.spacing.xs }} >
                            {subtitle}
                        </Text>
                    ) : null}
                    <Text size="md" weight="semiBold" color={theme.colors.white[50]}>
                        {title}
                    </Text>
                </View>

                <Pressable style={styles.moreBtn} onPress={onSeeMore}>
                    <ArrowRight2 size={20} color={theme.colors.grey[50]} />
                </Pressable>
            </View>

            {showActionIcons ? (
                <View style={styles.actions}>
                    <Pressable style={styles.iconBtn}>
                        <Edit2 size={20} color={theme.colors.white[50]} />
                    </Pressable>
                    <Pressable style={styles.iconBtn}>
                        <Send2 size={20} color={theme.colors.white[50]} />
                    </Pressable>
                </View>
            ) : null}

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
            >
                {items.map((item) => (
                    <ProfilePlaylistCard key={item.id} item={item} />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        gap: theme.sizes.spacing.md,
        marginTop: theme.sizes.spacing.xl,
    },
    header: {
        paddingHorizontal: theme.sizes.spacing.base,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    headerContent: {
        flex: 1,
    },
    moreBtn: {
        width: 24,
        height: 24,
        marginLeft: theme.sizes.spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actions: {
        paddingHorizontal: theme.sizes.spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.sm,
    },
    iconBtn: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    carousel: {
        paddingHorizontal: theme.sizes.spacing.base,
        gap: theme.sizes.spacing.base,
    },
});

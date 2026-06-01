import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { ProfilePlaylistItem } from './types';

type ProfilePlaylistCardProps = {
    item: ProfilePlaylistItem;
};

export default function ProfilePlaylistCard({ item }: ProfilePlaylistCardProps) {
    return (
        <Pressable
            style={styles.card}
            onPress={() => router.push(`/playlist/${item.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Open playlist ${item.title}`}
        >
            <Image source={item.image} style={styles.cover} />
            <View style={styles.meta}>
                <Text size="base" weight="medium" color={theme.colors.white[50]}>
                    {item.title}
                </Text>
                <Text size="sm" color={theme.colors.grey[100]} numberOfLines={1}>
                    {item.category} - {item.author}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 155,
        gap: theme.sizes.spacing.sm,
    },
    cover: {
        width: 155,
        height: 155,
        borderRadius: 4,
        backgroundColor: theme.colors.grey[700],
    },
    meta: {
        gap: 2,
    },
});

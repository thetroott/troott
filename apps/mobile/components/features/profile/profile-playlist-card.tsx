import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { ProfilePlaylistItem } from './types';

type ProfilePlaylistCardProps = {
    item: ProfilePlaylistItem;
};

export default function ProfilePlaylistCard({ item }: ProfilePlaylistCardProps) {
    return (
        <View style={styles.card}>
            <Image source={item.image} style={styles.cover} />
            <View style={styles.meta}>
                <Text size="base" weight="medium" color={theme.colors.white[50]}>
                    {item.title}
                </Text>
                <Text size="sm" color={theme.colors.grey[100]}>
                    {item.category} - {item.author}
                </Text>
                {/* <Text size="sm" color={theme.colors.grey[100]}>
                    - {item.metric}
                </Text> */}
            </View>
        </View>
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
    },
    meta: {
        gap: 2,
    },
});

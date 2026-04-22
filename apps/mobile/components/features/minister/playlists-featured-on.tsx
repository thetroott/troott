import React from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    type ImageSourcePropType,
} from 'react-native';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

export type FeaturedPlaylistItem = {
    id: string;
    title: string;
    year: string;
    image: ImageSourcePropType;
};

export type PlaylistsFeaturedOnProps = {
    title?: string;
    items?: FeaturedPlaylistItem[];
    onPressItem?: (item: FeaturedPlaylistItem, index: number) => void;
};

const defaultItems: FeaturedPlaylistItem[] = [
    {
        id: 'pfo-1',
        title: 'Beauty For Ashes',
        year: '2025',
        image: require('@/assets/images/cover.jpg'),
    },
    {
        id: 'pfo-2',
        title: 'He Said What',
        year: '2024',
        image: require('@/assets/images/cover4.jpg'),
    },
    {
        id: 'pfo-3',
        title: 'The Kingdom',
        year: '2024',
        image: require('@/assets/images/cover2.jpg'),
    },
    {
        id: 'pfo-4',
        title: 'Genesis The Beginning',
        year: '2023',
        image: require('@/assets/images/cover3.jpg'),
    },
];

export default function PlaylistsFeaturedOn({
    title = 'Playlists Featured On',
    items = defaultItems,
    onPressItem,
}: PlaylistsFeaturedOnProps) {
    return (
        <View style={styles.container}>
            <Text size="md" weight="semiBold" color={theme.colors.white[50]} style={{ marginTop: theme.sizes.spacing.md }}>
                {title}
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.row}
            >
                {items.map((item, index) => (
                    <Pressable
                        key={item.id}
                        style={styles.card}
                        onPress={() => onPressItem?.(item, index)}
                    >
                        <Image source={item.image} style={styles.cover} />
                        <View style={styles.meta}>
                            <Text
                                size="sm"
                                weight="medium"
                                color={theme.colors.white[50]}
                                numberOfLines={1}
                            >
                                {item.title}
                            </Text>
                            <Text size="sm" color={theme.colors.grey[200]}>
                                {item.year}
                            </Text>
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: theme.sizes.spacing.md,
    },
    row: {
        gap: theme.sizes.spacing.base,
        paddingRight: theme.sizes.spacing.base,
    },
    card: {
        width: 155,
        gap: theme.sizes.spacing.sm,
    },
    cover: {
        width: 155,
        height: 155,
        borderRadius: theme.sizes.radius.xs,
    },
    meta: {
        gap: 2,
    },
});

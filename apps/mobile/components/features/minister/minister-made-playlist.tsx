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

export type MinisterMadePlaylistItem = {
    id: string;
    title: string;
    type: string;
    minister: string;
    duration: string;
    image: ImageSourcePropType;
    /** Optional 2x2 collage mode from Figma first card */
    collageImages?: [ImageSourcePropType, ImageSourcePropType, ImageSourcePropType, ImageSourcePropType];
};

export type MinisterMadePlaylistProps = {
    title?: string;
    items?: MinisterMadePlaylistItem[];
    onPressItem?: (item: MinisterMadePlaylistItem, index: number) => void;
};

const defaultItems: MinisterMadePlaylistItem[] = [
    {
        id: 'mmp-1',
        title: 'Hope from Despair',
        type: 'Playlist',
        minister: 'Joshua Selman',
        duration: '58:30',
        image: require('@/assets/images/cover.jpg'),
        collageImages: [
            require('@/assets/images/2.jpg'),
            require('@/assets/images/4.jpg'),
            require('@/assets/images/6.jpg'),
            require('@/assets/images/8.jpg'),
        ],
    },
    {
        id: 'mmp-2',
        title: 'Grace Amid Trials',
        type: 'Playlist',
        minister: 'Joshua Selman',
        duration: '1:24:22',
        image: require('@/assets/images/cover2.jpg'),
    },
    {
        id: 'mmp-3',
        title: 'Strength in adversity.',
        type: 'Playlist',
        minister: 'Joshua Selman',
        duration: '58:30',
        image: require('@/assets/images/cover3.jpg'),
    },
];

export default function MinisterMadePlaylist({
    title = 'Minister-made Playlist',
    items = defaultItems,
    onPressItem,
}: MinisterMadePlaylistProps) {
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
                        {item.collageImages ? (
                            <View style={styles.collage}>
                                {item.collageImages.map((img, i) => (
                                    <Image
                                        key={`${item.id}-c-${i}`}
                                        source={img}
                                        style={styles.collageCell}
                                    />
                                ))}
                            </View>
                        ) : (
                            <Image source={item.image} style={styles.cover} />
                        )}

                        <View style={styles.meta}>
                            <Text
                                size="sm"
                                weight="medium"
                                color={theme.colors.white[50]}
                                numberOfLines={1}
                            >
                                {item.title}
                            </Text>

                            <View style={styles.inlineRow}>
                                <Text size="sm" color={theme.colors.grey[200]}>
                                    {item.type}
                                </Text>
                                <View style={styles.dot} />
                                <Text size="sm" color={theme.colors.grey[200]}>
                                    {item.minister}
                                </Text>
                            </View>
                            <View style={styles.inlineRow}>
                                <View style={styles.dot} />
                                <Text size="sm" color={theme.colors.grey[200]}>
                                    {item.duration}
                                </Text>
                            </View>
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
    collage: {
        width: 155,
        height: 155,
        borderRadius: theme.sizes.radius.xs,
        overflow: 'hidden',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    collageCell: {
        width: 77.5,
        height: 77.5,
    },
    meta: {
        gap: 2,
    },
    inlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 99,
        backgroundColor: theme.colors.grey[200],
    },
});

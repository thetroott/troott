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

export type SeriesCardItem = {
    id: string;
    title: string;
    year: string;
    image: ImageSourcePropType;
};

export type SeriesCardProps = {
    title?: string;
    items?: SeriesCardItem[];
    onPressItem?: (item: SeriesCardItem, index: number) => void;
};

const defaultItems: SeriesCardItem[] = [
    {
        id: 'series-1',
        title: 'Beauty For Ashes',
        year: '2025',
        image: require('@/assets/images/cover.jpg'),
    },
    {
        id: 'series-2',
        title: 'He Said What',
        year: '2024',
        image: require('@/assets/images/cover4.jpg'),
    },
    {
        id: 'series-3',
        title: 'The Kingdom',
        year: '2024',
        image: require('@/assets/images/cover2.jpg'),
    },
    {
        id: 'series-4',
        title: 'Genesis The Beginning',
        year: '2023',
        image: require('@/assets/images/cover3.jpg'),
    },
];

export default function SeriesCard({
    title = 'Series',
    items = defaultItems,
    onPressItem,
}: SeriesCardProps) {
    return (
        <View style={styles.container}>
            <Text size="2xl" weight="semiBold" color={theme.colors.white[50]}>
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
                                size="xl"
                                weight="medium"
                                color={theme.colors.white[50]}
                                numberOfLines={1}
                            >
                                {item.title}
                            </Text>
                            <Text size="xl" color={theme.colors.grey[200]}>
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

import React from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    type ImageSourcePropType,
    type StyleProp,
    type ViewStyle,
} from 'react-native';

import { SolidIcons } from '@/assets/icons';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';

export type NewSermonProps = {
    sermons?: SermonItemDTO[];
    label?: string;
    /** Per-card teal label (e.g. NEW SERMON / NEW PLAYLIST). Overrides `label` when set. */
    labelForItem?: (item: SermonItemDTO, index: number) => string;
    /** Bottom meta line under minister (default: topic uppercased). */
    formatFooter?: (item: SermonItemDTO, index: number) => string;
    onPressCard?: (item: SermonItemDTO, index: number) => void;
    onPressPlay?: (item: SermonItemDTO, index: number) => void;
    containerStyle?: StyleProp<ViewStyle>;
};

const FALLBACK_IMAGE = require('@/assets/images/cover2.jpg');
const FALLBACK_IMAGE2 = require('@/assets/images/cover3.jpg');
const DEFAULT_SERMONS: SermonItemDTO[] = [
    {
        id: 'falgglback-sermon',
        title: 'The Grace called Favour',
        minister: 'Apostle Joshua Selman',
        topic: 'Favour',
        image: FALLBACK_IMAGE2,
        sourceType: null,
    },
    {
        id: 'fallback-sermon',
        title: 'Walking in Faith',
        minister: 'Apostle Joshua Selman',
        topic: 'Faith',
        image: FALLBACK_IMAGE,
        sourceType: null,
    },
    {
        id: 'falgglback-sermon',
        title: 'The Grace called Favour',
        minister: 'Apostle Joshua Selman',
        topic: 'Favour',
        image: FALLBACK_IMAGE,
        sourceType: null,
    },
    {
        id: 'falglback-sermon',
        title: 'The Seed of Faith',
        minister: 'Apostle Joshua Selman',
        topic: 'Faith',
        image: FALLBACK_IMAGE2,
        sourceType: null,
    },
   
];

export default function NewSermon({
    sermons = DEFAULT_SERMONS,
    label = 'NEW SERMON',
    labelForItem,
    formatFooter,
    onPressCard,
    onPressPlay,
    containerStyle,
}: NewSermonProps) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.list, containerStyle]}
        >
            {sermons.map((item, index) => (
                <Pressable
                    key={`${item.id ?? item.title ?? 'sermon'}-${index}`}
                    style={styles.card}
                    onPress={() => onPressCard?.(item, index)}
                >
                    <Image
                        source={resolveImage(item)}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />

                    <View style={styles.content}>
                        <Text
                            size="sm"
                            color={theme.colors.teal[500]}
                            textStyle={styles.label}
                        >
                            {labelForItem
                                ? labelForItem(item, index)
                                : label}
                        </Text>
                        <Text
                            size="lg"
                            weight="medium"
                            color={theme.colors.white[50]}
                            numberOfLines={1}
                        >
                            {item.title ?? 'Walking in Faith'}
                        </Text>
                        <Text
                            size="sm"
                            color={theme.colors.grey[200]}
                            numberOfLines={1}
                        >
                            {`by ${item.minister ?? 'Unknown minister'}`}
                        </Text>
                        <Text
                            size="sm"
                            color={theme.colors.grey[200]}
                            numberOfLines={1}
                        >
                            {formatFooter
                                ? formatFooter(item, index)
                                : (item.topic ?? 'INSPIRATIONAL').toUpperCase()}
                        </Text>
                    </View>

                    <Pressable
                        style={styles.playButton}
                        onPress={() => onPressPlay?.(item, index)}
                        accessibilityRole="button"
                        accessibilityLabel="Play sermon"
                    >
                        <SolidIcons.PlayIcon
                            size={32}
                            color={theme.colors.black[100]}
                        />
                    </Pressable>
                </Pressable>
            ))}
        </ScrollView>
    );
}

function resolveImage(item: SermonItemDTO): ImageSourcePropType {
    const source = item.image ?? item.artwork;
    if (typeof source === 'number') return source;
    if (typeof source === 'string' && source.length > 0) {
        return { uri: source };
    }
    return FALLBACK_IMAGE;
}

const styles = StyleSheet.create({
    list: {
        gap: theme.sizes.spacing.base,
    },
    card: {
        width: 260,
        height: 386,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#252525',
    },
    heroImage: {
        width: 260,
        height: 260,
    },
    content: {
        height: 126,
        paddingHorizontal: theme.sizes.spacing.base,
        paddingVertical: theme.sizes.spacing.base,
        gap: theme.sizes.spacing.sm,
    },
    label: {
        letterSpacing: 0.24,
    },
    playButton: {
        position: 'absolute',
        right: theme.sizes.spacing.base,
        top: 232,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8E8E8',
    },
});

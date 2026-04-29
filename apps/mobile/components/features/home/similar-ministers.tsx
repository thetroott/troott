import React from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    type ImageSourcePropType,
} from 'react-native';
import { router } from 'expo-router';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

export type SimilarMinisterItem = {
    id: string;
    name: string;
    image: ImageSourcePropType;
};

export type SimilarMinistersProps = {
    title?: string;
    ctaLabel?: string;
    items?: SimilarMinisterItem[];
    onPressSeeMore?: () => void;
    onPressItem?: (item: SimilarMinisterItem, index: number) => void;
};

const defaultItems: SimilarMinisterItem[] = [
    {
        id: 'bolaji-idowu',
        name: 'Pastor Bolaji Idowu',
        image: require('@/assets/images/2.jpg'),
    },
    {
        id: 'sam-adeyemi',
        name: 'Pastor Sam Adeyemi',
        image: require('@/assets/images/4.jpg'),
    },
    {
        id: 'chris-oyakhilome',
        name: 'Pastor Chris Oyakhilome',
        image: require('@/assets/images/5.jpg'),
    },
];

export default function SimilarMinisters({
    title = 'Similar Ministers',
    ctaLabel = 'See More',
    items = defaultItems,
    onPressSeeMore,
    onPressItem,
}: SimilarMinistersProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text size="md" weight="semiBold" color={theme.colors.white[50]}>
                    {title}
                </Text>
                <Pressable
                    onPress={onPressSeeMore}
                    style={styles.seeMore}
                    accessibilityRole="button"
                    accessibilityLabel={ctaLabel}
                >
                    <Text size="xs" weight="medium" color={theme.colors.white[50]}>
                        {ctaLabel}
                    </Text>
                </Pressable>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.row}
            >
                {items.map((item, index) => (
                    <Pressable
                        key={item.id}
                        style={styles.card}
                        onPress={() => {
                            onPressItem?.(item, index);
                            if (!onPressItem) {
                                router.push(`/minister/${item.id}`);
                            }
                        }}
                    >
                        <Image source={item.image} style={styles.image} />
                        <Text
                            size="sm"
                            color={theme.colors.white[50]}
                            numberOfLines={2}
                        >
                            {item.name}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: theme.sizes.spacing.md,
        marginTop: theme.sizes.spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    seeMore: {
        minWidth: 65,
        height: 24,
        borderWidth: 1,
        borderColor: '#707070',
        borderRadius: theme.sizes.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.sizes.spacing.sm,
    },
    row: {
        gap: theme.sizes.spacing.base,
        paddingRight: theme.sizes.spacing.base,
    },
    card: {
        width: 145,
        gap: theme.sizes.spacing.sm,
    },
    image: {
        width: 145,
        height: 145,
        borderRadius: theme.sizes.radius.sm,
    },
});

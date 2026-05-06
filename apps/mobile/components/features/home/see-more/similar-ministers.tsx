import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SearchNormal } from 'iconsax-react-nativejs';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';

import ScreenView from '@/components/ui/screenview';
import Input from '@/components/ui/input';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

type MinisterItem = {
    id: string;
    name: string;
    image: number;
};

const ALL_MINISTERS: MinisterItem[] = [
    {
        id: 'joshua-selman',
        name: 'Apostle Joshua Selman',
        image: require('@/assets/images/1.jpg'),
    },
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
    {
        id: 'paul-adefarasin',
        name: 'Pastor Paul Adefarasin',
        image: require('@/assets/images/6.jpg'),
    },
    {
        id: 'jerry-eze',
        name: 'Pastor Jerry Eze',
        image: require('@/assets/images/7.jpg'),
    },
    {
        id: 'nathaniel-bassey',
        name: 'Pastor Nathaniel Bassey',
        image: require('@/assets/images/8.jpg'),
    },
    {
        id: 'folorunso-kumuyi',
        name: 'Pastor Folorunso Kumuyi',
        image: require('@/assets/images/9.jpg'),
    },
];

const CARD_SIZE = theme.sizes.screen.width * 0.3 - 10;

export default function SimilarMinistersSeeMoreScreen() {
    const [q, setQ] = useState('');

    const data = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (!needle) return ALL_MINISTERS;
        return ALL_MINISTERS.filter((m) =>
            m.name.toLowerCase().includes(needle),
        );
    }, [q]);

    return (
        <ScreenView screenStyle={styles.screen}>
            <View style={styles.headerRow}>
                <Pressable
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                    hitSlop={8}
                    style={styles.backBtn}
                >
                    <Text size="sm" weight="medium" color={theme.colors.teal[400]}>
                        Back
                    </Text>
                </Pressable>
                <Text
                    size="lg"
                    weight="semiBold"
                    color={theme.colors.white[50]}
                    numberOfLines={1}
                >
                    Similar Ministers
                </Text>
                <View style={styles.headerSpacer} />
            </View>
{/* 
            <Input
                leftIcon={
                    <SearchNormal size={20} color={theme.colors.grey[100]} />
                }
                placeholder="Search ministers"
                value={q}
                onChangeText={setQ}
                containerstyle={styles.searchField}
            /> */}

            <FlashList
                data={data}
                keyExtractor={(item) => item.id}
                numColumns={3}
               // estimatedItemSize={CARD_SIZE + 52}
                contentContainerStyle={styles.gridContent}
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.card}
                        onPress={() => router.push(`/minister/${item.id}`)}
                        accessibilityRole="button"
                        accessibilityLabel={item.name}
                    >
                        <Image
                            style={styles.image}
                            source={item.image}
                            accessibilityIgnoresInvertColors
                        />
                        <Text
                            size="xs"
                            color={theme.colors.white[50]}
                            numberOfLines={2}
                            textStyle={styles.cardLabel}
                        >
                            {item.name}
                        </Text>
                    </Pressable>
                )}
            />
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: theme.colors.black[50],
        paddingTop: theme.sizes.spacing.md,
        paddingHorizontal: theme.sizes.spacing.base,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.sizes.spacing.md,
    },
    backBtn: {
        paddingVertical: theme.sizes.spacing.xs,
        paddingRight: theme.sizes.spacing.md,
    },
    headerSpacer: {
        width: 48,
    },
    searchField: {
        borderRadius: theme.sizes.radius.md,
        backgroundColor: theme.colors.grey[800],
        borderWidth: 0,
        marginBottom: theme.sizes.spacing.md,
    },
    gridContent: {
        paddingBottom: theme.sizes.spacing['2xl'],
    },
    card: {
        gap: theme.sizes.spacing.sm,
        alignItems: 'center',
        width: CARD_SIZE,
        marginTop: theme.sizes.spacing.lg,
    },
    image: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        borderRadius: theme.sizes.radius.sm,
    },
    cardLabel: {
        textAlign: 'center',
    },
});


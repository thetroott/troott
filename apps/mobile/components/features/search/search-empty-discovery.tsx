import React from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { router } from 'expo-router';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { ISermonTrack } from '@/types/sermon';

type Props = {
    trendingQueries: readonly string[];
    popularSermons: ISermonTrack[];
    recentSermons: ISermonTrack[];
    onPickTrendingQuery: (q: string) => void;
};

function sermonThumbUri(row: ISermonTrack): string | null {
    const img = row.image;
    const art = row.artwork;
    if (typeof img === 'string' && img.length > 0) return img;
    if (typeof art === 'string' && art.length > 0) return art;
    return null;
}

/**
 * Discovery blocks below the empty-history hero (plan Phase 4): trending chips, catalog picks, library recents.
 */
export default function SearchEmptyDiscovery({
    trendingQueries,
    popularSermons,
    recentSermons,
    onPickTrendingQuery,
}: Props) {
    const showTrending = trendingQueries.length > 0;
    const showPopular = popularSermons.length > 0;
    const showRecent = recentSermons.length > 0;

    if (!showTrending && !showPopular && !showRecent) return null;

    return (
        <View style={styles.outer}>
            {showTrending ? (
                <View style={styles.section}>
                    <Text
                        weight="semiBold"
                        size="sm"
                        color={theme.colors.white[50]}
                        style={styles.sectionTitle}
                    >
                        Trending searches
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipsRow}
                        keyboardShouldPersistTaps="handled"
                    >
                        {trendingQueries.map((q) => (
                            <Pressable
                                key={q}
                                style={styles.chip}
                                onPress={() => onPickTrendingQuery(q)}
                                accessibilityRole="button"
                                accessibilityLabel={`Search ${q}`}
                            >
                                <Text size="xs" color={theme.colors.grey[800]} weight="medium">
                                    {q}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            ) : null}

            {showPopular ? (
                <View style={styles.section}>
                    <Text
                        weight="semiBold"
                        size="sm"
                        color={theme.colors.white[50]}
                        style={styles.sectionTitle}
                    >
                        Popular sermons
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.cardsRow}
                        keyboardShouldPersistTaps="handled"
                    >
                        {popularSermons.map((row) => {
                            const rawId = row.id != null ? String(row.id) : row.title;
                            const id = rawId ?? 'unknown';
                            const uri = sermonThumbUri(row);
                            return (
                                <Pressable
                                    key={id}
                                    style={styles.card}
                                    onPress={() =>
                                        router.push(
                                            `/sermon/${encodeURIComponent(id)}`,
                                        )
                                    }
                                    accessibilityRole="button"
                                    accessibilityLabel={row.title ?? 'Sermon'}
                                >
                                    <View style={styles.thumb}>
                                        {uri ? (
                                            <Image source={{ uri }} style={styles.thumbImg} />
                                        ) : null}
                                    </View>
                                    <Text
                                        size="xs"
                                        color={theme.colors.white[50]}
                                        numberOfLines={2}
                                        style={styles.cardTitle}
                                    >
                                        {row.title ?? 'Sermon'}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            ) : null}

            {showRecent ? (
                <View style={styles.section}>
                    <Text
                        weight="semiBold"
                        size="sm"
                        color={theme.colors.white[50]}
                        style={styles.sectionTitle}
                    >
                        Recently played
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.cardsRow}
                        keyboardShouldPersistTaps="handled"
                    >
                        {recentSermons.map((row) => {
                            const rawId = row.id != null ? String(row.id) : row.title;
                            const id = rawId ?? 'unknown';
                            const uri = sermonThumbUri(row);
                            return (
                                <Pressable
                                    key={`rp-${id}`}
                                    style={styles.card}
                                    onPress={() =>
                                        router.push(
                                            `/sermon/${encodeURIComponent(id)}`,
                                        )
                                    }
                                    accessibilityRole="button"
                                    accessibilityLabel={row.title ?? 'Sermon'}
                                >
                                    <View style={styles.thumb}>
                                        {uri ? (
                                            <Image source={{ uri }} style={styles.thumbImg} />
                                        ) : null}
                                    </View>
                                    <Text
                                        size="xs"
                                        color={theme.colors.white[50]}
                                        numberOfLines={2}
                                        style={styles.cardTitle}
                                    >
                                        {row.title ?? 'Sermon'}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            ) : null}
        </View>
    );
}

const CARD_W = 120;

const styles = StyleSheet.create({
    outer: {
        width: '100%',
        marginTop: theme.sizes.spacing.xl,
        paddingHorizontal: theme.sizes.spacing.md,
        gap: theme.sizes.spacing.lg,
    },
    section: {
        gap: theme.sizes.spacing.sm,
    },
    sectionTitle: {
        paddingHorizontal: theme.sizes.spacing.xs,
    },
    chipsRow: {
        flexDirection: 'row',
        gap: theme.sizes.spacing.sm,
        paddingVertical: theme.sizes.spacing.xs,
    },
    chip: {
        paddingHorizontal: theme.sizes.spacing.md,
        paddingVertical: theme.sizes.spacing.sm,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: theme.colors.grey[50],
    },
    cardsRow: {
        gap: theme.sizes.spacing.md,
        paddingVertical: theme.sizes.spacing.xs,
    },
    card: {
        width: CARD_W,
    },
    thumb: {
        width: CARD_W,
        height: CARD_W,
        borderRadius: theme.sizes.radius.sm,
        overflow: 'hidden',
        backgroundColor: theme.colors.grey[700],
        marginBottom: theme.sizes.spacing.xs,
    },
    thumbImg: {
        width: '100%',
        height: '100%',
    },
    cardTitle: {
        minHeight: 36,
    },
});

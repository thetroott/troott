import React, { useCallback } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    type LayoutChangeEvent,
} from 'react-native';
import { router } from 'expo-router';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import {
    useSearchHistory,
    type SearchHistoryEntry,
} from '@/api/hooks/app/useSearch';
import { useContextType } from '@/state/app-state';

type RecentSearchesProps = {
    /** Optional vertical spacing above the section (handled by parent when omitted). */
    onLayout?: (e: LayoutChangeEvent) => void;
};

/**
 * Search landing: horizontal chips from MMKV-backed recent searches (`useSearch` module).
 */
export default function RecentSearches({ onLayout }: RecentSearchesProps) {
    const { userContext } = useContextType();
    const userId = (userContext.user as { id?: string } | null)?.id;
    const { entries } = useSearchHistory(userId);

    const openEntry = useCallback((entry: SearchHistoryEntry) => {
        router.push({
            pathname: '/search/query',
            params: { q: entry.query },
        });
    }, []);

    if (entries.length === 0) {
        return null;
    }

    return (
        <View style={styles.wrap} onLayout={onLayout}>
            <Text
                weight="semiBold"
                size="md"
                color={theme.colors.white[50]}
                style={styles.title}
            >
                Recent searches
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.row}
            >
                {entries.slice(0, 12).map((entry) => (
                    <Pressable
                        key={entry.id}
                        onPress={() => openEntry(entry)}
                        style={({ pressed }) => [
                            styles.chip,
                            pressed && styles.chipPressed,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Recent search ${entry.query}`}
                    >
                        <Text
                            size="sm"
                            color={theme.colors.grey[100]}
                            numberOfLines={1}
                        >
                            {entry.query}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        gap: theme.sizes.spacing.sm,
    },
    title: {
        marginBottom: theme.sizes.spacing.xs,
    },
    row: {
        flexDirection: 'row',
        gap: theme.sizes.spacing.sm,
        paddingVertical: theme.sizes.spacing.xs,
    },
    chip: {
        maxWidth: 220,
        paddingHorizontal: theme.sizes.spacing.md,
        paddingVertical: theme.sizes.spacing.sm,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: theme.colors.grey[800],
        borderWidth: 1,
        borderColor: theme.colors.grey[700],
    },
    chipPressed: {
        opacity: 0.85,
    },
});

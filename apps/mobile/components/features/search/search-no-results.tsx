import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SearchNormal } from 'iconsax-react-nativejs';
import { router } from 'expo-router';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import { BROWSE_TOPICS } from '@/constants/browse-topics';
import { captureSearchEvent } from '@/components/features/search/search.analytics';

type SearchNoResultsProps = {
    /** When a filter chip is active, offer reset to all sermons. */
    showClearFilters?: boolean;
    onClearFilters?: () => void;
};

const SUGGESTED_TOPICS = BROWSE_TOPICS.slice(0, 6);

export default function SearchNoResults({
    showClearFilters = false,
    onClearFilters,
}: SearchNoResultsProps) {
    return (
        <ScrollView
            contentContainerStyle={styles.wrap}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <SearchNormal
                size={56}
                color={theme.colors.teal[400]}
                variant="Bold"
            />
            <Text
                size="xl"
                weight="semiBold"
                color={theme.colors.white[50]}
                style={styles.title}
            >
                No results found
            </Text>
            <Text size="sm" color={theme.colors.grey[400]} style={styles.subtitle}>
                Try another keyword or browse a topic below.
            </Text>

            {showClearFilters && onClearFilters ? (
                <Pressable
                    style={styles.clearFiltersButton}
                    onPress={onClearFilters}
                    accessibilityRole="button"
                    accessibilityLabel="Clear search filters"
                >
                    <Text size="sm" weight="semiBold" color={theme.colors.teal[400]}>
                        Clear filters
                    </Text>
                </Pressable>
            ) : null}

            <Text
                size="sm"
                weight="semiBold"
                color={theme.colors.white[50]}
                style={styles.topicsTitle}
            >
                Browse topics
            </Text>
            <View style={styles.topicsRow}>
                {SUGGESTED_TOPICS.map((topic) => (
                    <Pressable
                        key={topic.slug}
                        style={styles.topicChip}
                        onPress={() => {
                            captureSearchEvent('search_empty_topic_tapped', {
                                topic_slug: topic.slug,
                            });
                            router.push(
                                `/search/topic/${encodeURIComponent(topic.slug)}`,
                            );
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Browse ${topic.label}`}
                    >
                        <Text size="xs" color={theme.colors.grey[100]}>
                            {topic.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.sizes.spacing.xl,
        paddingVertical: theme.sizes.spacing['2xl'],
        gap: theme.sizes.spacing.sm,
    },
    title: {
        marginTop: theme.sizes.spacing.md,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
    },
    clearFiltersButton: {
        marginTop: theme.sizes.spacing.sm,
        paddingVertical: theme.sizes.spacing.sm,
        paddingHorizontal: theme.sizes.spacing.lg,
    },
    topicsTitle: {
        marginTop: theme.sizes.spacing.lg,
        alignSelf: 'flex-start',
    },
    topicsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.sizes.spacing.sm,
        marginTop: theme.sizes.spacing.sm,
        alignSelf: 'stretch',
    },
    topicChip: {
        paddingHorizontal: theme.sizes.spacing.md,
        paddingVertical: theme.sizes.spacing.sm,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: theme.colors.grey[800],
        borderWidth: 1,
        borderColor: theme.colors.grey[700],
    },
});

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import ScreenView from '@/components/ui/screenview';
import { theme } from '@/constants/theme';
import { BROWSE_TOPICS } from '@/constants/browse-topics';
import SearchTabHeader from '@/components/features/search/search-tab-header';
import SearchQueryBarTrigger from '@/components/features/search/search-query-bar-trigger';
import RecentlyAdded from '@/components/features/search/recently-added';
import RecentSearches from '@/components/features/search/recent-searches';
import BrowseTopicsGrid from '@/components/features/search/browse-topics-grid';

/**
 * Figma Search (idle) — profile + title + bell, search field, recently played, browse topics.
 * Query flow lives in `app/(tabs)/search/query.tsx`.
 */
export default function SearchLandingScreen() {
    return (
        <ScreenView>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                <SearchTabHeader />
                <SearchQueryBarTrigger />
                <View style={{ marginTop: theme.sizes.spacing.lg }} />
                <RecentSearches />
                <View style={{ marginTop: theme.sizes.spacing.xl }} />
                <RecentlyAdded />
                <View style={{ marginTop: theme.sizes.spacing.xl }}></View>
                <BrowseTopicsGrid topics={BROWSE_TOPICS} />
            </ScrollView>
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    content: {
        gap: 0,
        paddingBottom: theme.sizes.spacing['2xl'],
    },
});

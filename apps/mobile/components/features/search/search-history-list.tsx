import React from 'react';
import { FlatList, type ListRenderItem, StyleSheet, View } from 'react-native';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { SearchHistoryEntry } from '@/api/hooks/app/useSearch';
import SearchHistoryItem from '@/components/features/search/search-history-item';

type Props = {
    entries: SearchHistoryEntry[];
    ListFooterComponent: React.ReactElement | null;
    onSelect: (entry: SearchHistoryEntry) => void;
    onRemove: (entryId: string) => void;
};

export default function SearchHistoryList({
    entries,
    ListFooterComponent,
    onSelect,
    onRemove,
}: Props) {
    const renderItem: ListRenderItem<SearchHistoryEntry> = ({ item }) => (
        <SearchHistoryItem
            entry={item}
            onPress={() => onSelect(item)}
            onRemove={() => onRemove(item.id)}
        />
    );

    return (
        <FlatList
            style={styles.list}
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
                <Text
                    weight="semiBold"
                    size="md"
                    color={theme.colors.white[50]}
                    style={styles.sectionHdr}
                >
                    Recent searches
                </Text>
            }
            ListFooterComponent={
                ListFooterComponent ? (
                    <View style={styles.footer}>{ListFooterComponent}</View>
                ) : undefined
            }
            contentContainerStyle={styles.listContent}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
    listContent: {
        flexGrow: 1,
        paddingBottom: theme.sizes.spacing.xl,
    },
    sectionHdr: {
        marginTop: theme.sizes.spacing.sm,
        marginBottom: theme.sizes.spacing.md,
    },
    footer: {
        paddingTop: theme.sizes.spacing.sm,
    },
});

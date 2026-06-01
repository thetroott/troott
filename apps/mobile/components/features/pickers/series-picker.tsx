import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import { CloseCircle } from 'iconsax-react-nativejs';

import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import { useSeriesPickerSearchQuery } from '@/api/hooks/app/useSearch';

export type SeriesPickerProps = {
    title: string;
    searchPlaceholder: string;
    primaryLabel: string;
    showClose?: boolean;
    onClose?: () => void;
    loading?: boolean;
    loadingTitle?: string;
    onPrimaryPress: (selectedIds: string[]) => void | Promise<void>;
    selectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
};

function seriesLabel(row: Record<string, unknown>): string {
    if (typeof row.title === 'string' && row.title.trim()) {
        return row.title.trim();
    }
    if (typeof row.name === 'string' && row.name.trim()) {
        return row.name.trim();
    }
    return 'Series';
}

function seriesId(row: Record<string, unknown>): string {
    const id = row._id ?? row.id;
    return id != null ? String(id) : '';
}

export default function SeriesPicker({
    title,
    searchPlaceholder,
    primaryLabel,
    showClose,
    onClose,
    loading,
    loadingTitle = 'Loading',
    onPrimaryPress,
    selectedIds: controlledSelected,
    onSelectionChange,
}: SeriesPickerProps) {
    const [query, setQuery] = useState('');
    const [internalSelected, setInternalSelected] = useState<string[]>([]);
    const selected = controlledSelected ?? internalSelected;

    const { data: seriesRows = [], isFetching, isError } =
        useSeriesPickerSearchQuery(query, true);

    const setSelected = (ids: string[]) => {
        onSelectionChange?.(ids);
        if (controlledSelected == null) {
            setInternalSelected(ids);
        }
    };

    const toggle = (id: string) => {
        const next = selected.includes(id)
            ? selected.filter((x) => x !== id)
            : [...selected, id];
        setSelected(next);
    };

    const listEmpty = useMemo(() => {
        if (query.trim().length < 2) {
            return 'Type at least 2 characters to search series.';
        }
        if (isFetching) {
            return null;
        }
        if (isError) {
            return 'Could not load series. Try again.';
        }
        return 'No series found.';
    }, [query, isFetching, isError]);

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.headerRow}>
                <Text weight="semiBold" size="xl" color={theme.colors.white[50]}>
                    {title}
                </Text>
                {showClose ? (
                    <Pressable onPress={onClose} hitSlop={12}>
                        <CloseCircle
                            size={26}
                            color={theme.colors.white[50]}
                            variant="Outline"
                        />
                    </Pressable>
                ) : null}
            </View>
            <Input
                placeholder={searchPlaceholder}
                value={query}
                onChangeText={setQuery}
                editable={!loading}
            />
            {isFetching && !loading ? (
                <ActivityIndicator color={theme.colors.teal[400]} />
            ) : null}
            <FlatList
                data={seriesRows as Record<string, unknown>[]}
                keyExtractor={(item, index) => seriesId(item) || `series-${index}`}
                style={styles.list}
                ListEmptyComponent={
                    listEmpty ? (
                        <Text size="sm" color={theme.colors.grey[300]}>
                            {listEmpty}
                        </Text>
                    ) : null
                }
                renderItem={({ item }) => {
                    const id = seriesId(item);
                    if (!id) {
                        return null;
                    }
                    const active = selected.includes(id);
                    return (
                        <Pressable
                            style={[styles.row, active && styles.rowActive]}
                            onPress={() => toggle(id)}
                        >
                            <Text color={theme.colors.white[50]}>
                                {seriesLabel(item)}
                            </Text>
                        </Pressable>
                    );
                }}
            />
            {loading ? (
                <View style={styles.loading}>
                    <ActivityIndicator color={theme.colors.teal[400]} />
                    <Text color={theme.colors.grey[400]}>{loadingTitle}</Text>
                </View>
            ) : null}
            <Button
                label={primaryLabel}
                disabled={selected.length === 0 || loading}
                onPress={() => void onPrimaryPress(selected)}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, gap: theme.sizes.spacing.md },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    list: { flex: 1 },
    row: {
        paddingVertical: theme.sizes.spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.grey[700],
    },
    rowActive: {
        backgroundColor: theme.colors.grey[800],
    },
    loading: {
        alignItems: 'center',
        gap: theme.sizes.spacing.sm,
    },
});

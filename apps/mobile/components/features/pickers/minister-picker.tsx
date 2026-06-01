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
import { useMinisterPickerSearchQuery } from '@/api/hooks/app/useSearch';

export type MinisterPickerProps = {
    title: string;
    subtitle?: string;
    searchPlaceholder: string;
    minSelection?: number;
    primaryLabel: string;
    onPrimaryPress: (selectedIds: string[]) => void;
    showClose?: boolean;
    onClose?: () => void;
    selectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
};

export default function MinisterPicker({
    title,
    subtitle,
    searchPlaceholder,
    minSelection = 1,
    primaryLabel,
    onPrimaryPress,
    showClose,
    onClose,
    selectedIds: controlledSelected,
    onSelectionChange,
}: MinisterPickerProps) {
    const [query, setQuery] = useState('');
    const [internalSelected, setInternalSelected] = useState<string[]>([]);
    const selected = controlledSelected ?? internalSelected;

    const { data: ministers = [], isFetching, isError } =
        useMinisterPickerSearchQuery(query, true);

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

    const canSubmit = selected.length >= minSelection;

    const listEmpty = useMemo(() => {
        if (query.trim().length < 2) {
            return 'Type at least 2 characters to search ministers.';
        }
        if (isFetching) {
            return null;
        }
        if (isError) {
            return 'Could not load ministers. Try again.';
        }
        return 'No ministers found.';
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
            {subtitle ? (
                <Text color={theme.colors.grey[400]} size="sm">
                    {subtitle}
                </Text>
            ) : null}
            <Input
                placeholder={searchPlaceholder}
                value={query}
                onChangeText={setQuery}
            />
            {isFetching ? (
                <ActivityIndicator color={theme.colors.teal[400]} />
            ) : null}
            <FlatList
                data={ministers}
                keyExtractor={(item) => item.id}
                style={styles.list}
                ListEmptyComponent={
                    listEmpty ? (
                        <Text size="sm" color={theme.colors.grey[300]}>
                            {listEmpty}
                        </Text>
                    ) : null
                }
                renderItem={({ item }) => {
                    const active = selected.includes(item.id);
                    return (
                        <Pressable
                            style={[styles.row, active && styles.rowActive]}
                            onPress={() => toggle(item.id)}
                        >
                            <Text color={theme.colors.white[50]}>
                                {item.name}
                            </Text>
                        </Pressable>
                    );
                }}
            />
            <Button
                label={primaryLabel}
                disabled={!canSubmit}
                onPress={() => onPrimaryPress(selected)}
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
});

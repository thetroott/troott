import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { SearchHistoryEntry } from '@/api/hooks/app/useSearch';
import SearchArrowRightUp from '@/components/features/search/search-arrow-right-up';

type Props = {
    entry: SearchHistoryEntry;
    onPress: () => void;
    onRemove: () => void;
};

function SearchHistoryItemBase({ entry, onPress, onRemove }: Props) {
    const swipeRef = useRef<Swipeable>(null);

    const renderRightActions = useCallback(() => {
        return (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${entry.query}`}
                onPress={() => {
                    swipeRef.current?.close();
                    onRemove();
                }}
                style={styles.deleteWrap}
            >
                <View style={styles.deleteBtn}>
                    <Text size="sm" weight="semiBold" color={theme.colors.white[50]}>
                        Delete
                    </Text>
                </View>
            </Pressable>
        );
    }, [entry.query, onRemove]);

    return (
        <Swipeable
            ref={swipeRef}
            friction={2}
            overshootRight={false}
            renderRightActions={renderRightActions}
        >
            <Pressable
                style={styles.row}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={entry.query}
            >
                <Text
                    size="xs"
                    color={theme.colors.white[50]}
                    weight="regular"
                    style={styles.label}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {entry.query}
                </Text>
                <SearchArrowRightUp color={theme.colors.white[50]} size={24} />
            </Pressable>
        </Swipeable>
    );
}

export default React.memo(SearchHistoryItemBase);

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 48,
        paddingVertical: theme.sizes.spacing.base,
        paddingRight: theme.sizes.spacing.xs,
        backgroundColor: 'transparent',
    },
    label: {
        flex: 1,
        paddingRight: theme.sizes.spacing.sm,
    },
    deleteWrap: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        backgroundColor: 'transparent',
    },
    deleteBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 88,
        flex: 1,
        backgroundColor: theme.colors.red[500],
        marginVertical: 4,
        borderRadius: theme.sizes.radius.sm,
        marginRight: theme.sizes.spacing.xs,
    },
});

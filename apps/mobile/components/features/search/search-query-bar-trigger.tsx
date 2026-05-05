import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { SearchNormal } from 'iconsax-react-nativejs';
import { router } from 'expo-router';

import Input from '@/components/ui/input';
import {
    SEARCH_FIELD_FILL,
    SEARCH_QUERY_PLACEHOLDER,
} from '@/constants/search-ui';
import { theme } from '@/constants/theme';

type Props = {
    /** Optional style override (e.g. for landing vs modal). */
    style?: ViewStyle;
};

/**
 * Tappable search field (Figma Search idle) — navigates to full search / query.
 */
export default function SearchQueryBarTrigger({ style }: Props) {
    return (
        <Pressable
            onPress={() => router.push('/search/query')}
            style={({ pressed }) => [
                style,
                { opacity: pressed ? 0.9 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open search"
            accessibilityHint={SEARCH_QUERY_PLACEHOLDER}
        >
            <View pointerEvents="none">
                <Input
                    editable={false}
                    leftIcon={
                        <SearchNormal
                            size={20}
                            color={theme.colors.grey[400]}
                        />
                    }
                    placeholder={SEARCH_QUERY_PLACEHOLDER}
                    containerstyle={styles.inputContainer}
                />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        height: 44,
        borderWidth: 0,
        borderRadius: theme.sizes.radius.sm,
        backgroundColor: SEARCH_FIELD_FILL,
    },
});

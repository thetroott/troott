import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { SearchNormal } from 'iconsax-react-nativejs';
import { router } from 'expo-router';

import Input from '@/components/ui/input';
import { theme } from '@/constants/theme';

const PLACEHOLDER = 'Search sermons, pastors, topics…';

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
            accessibilityHint={PLACEHOLDER}
        >
            <View pointerEvents="none">
                <Input
                    editable={false}
                    leftIcon={
                        <SearchNormal
                            size={20}
                            color={theme.colors.white[100]}
                        />
                    }
                    placeholder={PLACEHOLDER}
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
        borderRadius: 12,
        backgroundColor: '#292929',
    },
});

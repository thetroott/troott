import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SearchNormal } from 'iconsax-react-nativejs';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

export default function SearchNoResults() {
    return (
        <View style={styles.wrap}>
            <SearchNormal size={56} color={theme.colors.teal[400]} variant="Bold" />
            <Text
                size="xl"
                weight="semiBold"
                color={theme.colors.white[50]}
                style={styles.title}
            >
                No results found!
            </Text>
            <Text size="sm" color={theme.colors.grey[400]}>
                Try other keywords.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flex: 1,
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
});

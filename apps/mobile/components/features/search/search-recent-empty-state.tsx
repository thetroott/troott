import React from 'react';
import { StyleSheet, View } from 'react-native';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

/**
 * Empty-history hero when the query field is blank — aligns with search idle / discovery
 * ([Figma 5176-22322](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=5176-22322), clear-recents variant 5189:25544).
 */
export default function SearchRecentEmptyState() {
    return (
        <View
            style={styles.wrap}
            accessibilityRole="text"
            accessibilityLabel="Ready for a fresh start. Search for sermons, ministers, or playlists."
        >
            <Text
                size="md"
                weight="semiBold"
                color={theme.colors.white[50]}
                style={styles.title}
            >
                Play what you love
            </Text>
            <Text
                size="sm"
                weight="regular"
                color={theme.colors.grey[200]}
                style={styles.subtitle}
            >
                Search sermons, pastors, topics, and more
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        paddingHorizontal: theme.sizes.spacing.lg,
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        marginTop: theme.sizes.spacing.sm,
        maxWidth: 340,
    },
});

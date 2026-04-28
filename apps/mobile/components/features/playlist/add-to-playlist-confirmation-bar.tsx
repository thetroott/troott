import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

export type AddToPlaylistConfirmationBarProps = {
    playlistName: string;
    onView?: () => void;
};

/**
 * Snackbar after a sermon is saved to a playlist.
 * Figma: 8884-64977
 */
export default function AddToPlaylistConfirmationBar({
    playlistName,
    onView,
}: AddToPlaylistConfirmationBarProps) {
    return (
        <View style={styles.bar} accessible accessibilityLabel={`Sermon added to ${playlistName}`}>
            <Text
                size="sm"
                color={theme.colors.grey[50]}
                textStyle={styles.message}
                numberOfLines={2}
            >
                Sermon added to {playlistName}
            </Text>
            {onView ? (
                <Pressable onPress={onView} hitSlop={8} accessibilityRole="button">
                    <Text size="sm" color={theme.colors.teal[500]}>
                        View
                    </Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#3a3636',
        borderRadius: 6,
        minHeight: 52,
        paddingVertical: theme.sizes.spacing.xs,
        paddingHorizontal: theme.sizes.spacing.xs,
    },
    message: {
        flex: 1,
        marginRight: theme.sizes.spacing.md,
    },
});

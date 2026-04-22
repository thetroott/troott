import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

export type LikeFavoritesAlertProps = {
    title?: string;
    description?: string;
    actionLabel?: string;
    onPressAction?: () => void;
};

export default function LikeFavoritesAlert({
    title = 'Like your favorites',
    description = 'Sermons that you like will be saved to Your likes playlist and improve your sermon recommendations. Liked sermons will be saved to your library',
    actionLabel = 'OK',
    onPressAction,
}: LikeFavoritesAlertProps) {
    return (
        <View style={styles.container}>
            <View style={styles.topAccent} />

            <View style={styles.content}>
                <Text
                    size="2xl"
                    weight="bold"
                    color={theme.colors.white[50]}
                    textStyle={styles.title}
                >
                    {title}
                </Text>
                <Text
                    size="sm"
                    color={theme.colors.white[100]}
                    textStyle={styles.description}
                >
                    {description}
                </Text>
            </View>

            <View style={styles.divider} />

            <Pressable
                style={styles.actionRow}
                onPress={onPressAction}
                accessibilityRole="button"
                accessibilityLabel={actionLabel}
            >
                <Text size="2xl" weight="semiBold" color={theme.colors.teal[500]}>
                    {actionLabel}
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 273,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#252525',
    },
    topAccent: {
        height: 8,
        width: '100%',
        backgroundColor: '#86E4EE',
    },
    content: {
        paddingHorizontal: theme.sizes.spacing.base,
        paddingTop: theme.sizes.spacing.base,
        paddingBottom: theme.sizes.spacing.lg,
        gap: theme.sizes.spacing.md,
    },
    title: {
        lineHeight: 24,
    },
    description: {
        lineHeight: 36 / 2,
        opacity: 0.8,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(84,84,88,0.65)',
    },
    actionRow: {
        height: 44,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingHorizontal: theme.sizes.spacing.lg,
    },
});

import { Pressable, StyleSheet, View } from 'react-native';
import React from 'react';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

export function LibraryErrorState({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <View style={styles.centered}>
            <Text
                size="base"
                color={theme.colors.grey[200]}
                style={styles.centerText}
            >
                {message}
            </Text>
            <Pressable style={styles.retryBtn} onPress={onRetry}>
                <Text size="sm" weight="semiBold" color={theme.colors.teal[500]}>
                    Retry
                </Text>
            </Pressable>
        </View>
    );
}

export function LibraryEmptyState({
    title,
    subtitle,
    actionLabel,
    onAction,
    icon,
    actionFilled,
    secondaryActionLabel,
    onSecondaryAction,
}: {
    title?: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: React.ReactNode;
    /** Primary teal pill (e.g. Library Downloaded empty / Figma parity) */
    actionFilled?: boolean;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
}) {
    return (
        <View style={styles.centered}>
            {icon ? (
                <View style={{ marginBottom: theme.sizes.spacing.md }}>
                    {icon}
                </View>
            ) : null}
            {title ? (
                <Text
                    size="lg"
                    weight="semiBold"
                    color={theme.colors.white[50]}
                    style={styles.centerText}
                >
                    {title}
                </Text>
            ) : null}
            {subtitle ? (
                <Text
                    size="sm"
                    color={theme.colors.grey[300]}
                    style={[styles.centerText, styles.subtitle]}
                >
                    {subtitle}
                </Text>
            ) : null}
            {actionLabel && onAction ? (
                <Pressable
                    style={[
                        styles.actionBtn,
                        actionFilled ? styles.actionFilled : null,
                    ]}
                    onPress={onAction}
                    accessibilityRole="button"
                    accessibilityLabel={actionLabel}
                >
                    <Text
                        size="sm"
                        weight="semiBold"
                        color={
                            actionFilled
                                ? theme.colors.grey[900]
                                : theme.colors.teal[500]
                        }
                    >
                        {actionLabel}
                    </Text>
                </Pressable>
            ) : null}
            {secondaryActionLabel && onSecondaryAction ? (
                <Pressable
                    style={styles.secondaryLink}
                    onPress={onSecondaryAction}
                    accessibilityRole="button"
                    accessibilityLabel={secondaryActionLabel}
                >
                    <Text
                        size="sm"
                        weight="medium"
                        color={theme.colors.teal[400]}
                    >
                        {secondaryActionLabel}
                    </Text>
                </Pressable>
            ) : null}
        </View>
    );
}

export function LibraryListSkeleton() {
    return (
        <View style={styles.skeletonWrap} accessibilityRole="progressbar">
            {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.skeletonRow} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    centered: {
        paddingVertical: theme.sizes.spacing.xl,
        paddingHorizontal: theme.sizes.spacing.md,
        alignItems: 'center',
    },
    centerText: {
        textAlign: 'center',
    },
    subtitle: {
        marginTop: theme.sizes.spacing.sm,
    },
    actionBtn: {
        marginTop: theme.sizes.spacing.lg,
        paddingVertical: theme.sizes.spacing.sm,
        paddingHorizontal: theme.sizes.spacing.md,
    },
    actionFilled: {
        backgroundColor: theme.colors.teal[500],
        borderRadius: theme.sizes.radius.full,
        paddingVertical: theme.sizes.spacing.md,
        paddingHorizontal: theme.sizes.spacing.xl,
    },
    secondaryLink: {
        marginTop: theme.sizes.spacing.md,
        paddingVertical: theme.sizes.spacing.sm,
    },
    retryBtn: {
        marginTop: theme.sizes.spacing.md,
        padding: theme.sizes.spacing.sm,
    },
    skeletonWrap: {
        gap: theme.sizes.spacing.md,
        paddingVertical: theme.sizes.spacing.sm,
    },
    skeletonRow: {
        height: 72,
        borderRadius: theme.sizes.radius.md,
        backgroundColor: theme.colors.grey[700],
    },
});

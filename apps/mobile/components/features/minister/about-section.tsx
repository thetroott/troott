import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

export type AboutSectionProps = {
    ministerName?: string;
    text: string;
    ctaLabel?: string;
    onPressCta?: () => void;
};

export default function AboutSection({
    ministerName = 'Unknown Minister',
    text,
    ctaLabel = 'Read More',
    onPressCta,
}: AboutSectionProps) {
    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text size="md" weight="semiBold" color={theme.colors.white[50]}>
                    {ministerName}
                </Text>
                <Pressable style={styles.followButton}>
                    <Text
                        size="sm"
                        weight="semiBold"
                        color={theme.colors.white[50]}
                        textStyle={styles.followLabel}
                    >
                        Follow
                    </Text>
                </Pressable>
            </View>
            <Text
                size="base"
                color={theme.colors.grey[300]}
                textStyle={styles.copy}
                numberOfLines={5}
            >
                {text}{' '}
                <Text
                    size="base"
                    weight="semiBold"
                    color={theme.colors.white[50]}
                    onPress={onPressCta}
                >
                    {ctaLabel}
                </Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: theme.sizes.spacing.md,
        marginTop: theme.sizes.spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    followButton: {
        minWidth: 65,
        height: 24,
        borderWidth: 1,
        borderColor: '#707070',
        borderRadius: theme.sizes.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.sizes.spacing.sm,
    },
    followLabel: {
        fontSize: 10,
        lineHeight: 12,
        letterSpacing: 0.2,
    },
    copy: {
        lineHeight: 20,
    },
});

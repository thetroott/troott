import React from 'react';
import { StyleSheet, View } from 'react-native';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

export type AboutSectionProps = {
    title?: string;
    text: string;
    ctaLabel?: string;
    onPressCta?: () => void;
};

export default function AboutSection({
    title = 'About',
    text,
    ctaLabel = 'Read More',
    onPressCta,
}: AboutSectionProps) {
    return (
        <View style={styles.container}>
            <Text size="2xl" weight="semiBold" color={theme.colors.white[50]}>
                {title}
            </Text>
            <Text
                size="base"
                color={theme.colors.grey[100]}
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
    copy: {
        lineHeight: 20,
    },
});

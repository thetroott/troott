import React from 'react';
import {
    Text as RNText,
    StyleSheet,
    type TextProps as RNTextProps,
} from 'react-native';
import { fontSizes } from '@troott/tokens';

type TextVariant = 'body' | 'caption' | 'title' | 'subtitle';

export interface TextProps extends RNTextProps {
    variant?: TextVariant;
}

export function Text({ variant = 'body', style, ...rest }: TextProps) {
    return (
        <RNText
            style={[styles.base, getVariantStyle(variant), style]}
            {...rest}
        />
    );
}

function getVariantStyle(variant: TextVariant) {
    switch (variant) {
        case 'caption':
            return styles.caption;
        case 'title':
            return styles.title;
        case 'subtitle':
            return styles.subtitle;
        case 'body':
        default:
            return styles.body;
    }
}

const styles = StyleSheet.create({
    base: {
        color: 'inherit',
    },
    body: {
        fontSize: fontSizes.base,
        lineHeight: fontSizes.base * 1.5,
    },
    caption: {
        fontSize: fontSizes.sm,
        lineHeight: fontSizes.sm * 1.4,
    },
    title: {
        fontSize: fontSizes['2xl'],
        lineHeight: fontSizes['2xl'] * 1.2,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: fontSizes.lg,
        lineHeight: fontSizes.lg * 1.3,
        fontWeight: '600',
    },
});

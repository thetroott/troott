import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ArrowDown2 } from 'iconsax-react-nativejs';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import InstagramIcon from '@/assets/icons/instagram.svg';
import XSocialIcon from '@/assets/icons/x-social.svg';
import TikTokIcon from '@/assets/icons/tiktok.svg';

export type SocialLinkItem = {
    id: string;
    label: string;
    handle: string;
    iconText?: string;
};

export type AboutDetailsPanelProps = {
    title?: string;
    bio: string;
    ministryLabel?: string;
    ministryName: string;
    socialTitle?: string;
    socialLinks: SocialLinkItem[];
    onPressBack?: () => void;
    onPressSocial?: (item: SocialLinkItem) => void;
};

const defaultLinks: SocialLinkItem[] = [
    {
        id: 'instagram',
        label: 'Instagram',
        handle: '@KoinoniaMinistry',
        iconText: 'IG',
    },
    { id: 'x', label: 'X', handle: '@KoinoniaMinistry', iconText: 'X' },
    { id: 'tiktok', label: 'TikTok', handle: '@KoinoniaMinistry', iconText: 'TT' },
];

export default function AboutDetailsPanel({
    title = 'Joshua Selman',
    bio,
    ministryLabel = 'Ministry',
    ministryName,
    socialTitle = 'Social Media Links',
    socialLinks = defaultLinks,
    onPressBack,
    onPressSocial,
}: AboutDetailsPanelProps) {
    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <Pressable
                    onPress={onPressBack}
                    style={styles.backButton}
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                >
                    <ArrowDown2 size={18} color={theme.colors.white[50]} />
                </Pressable>
                <Text size="lg" weight="semiBold" color={theme.colors.white[50]}>
                    {title}
                </Text>
                <View style={styles.backButton} />
            </View>

            <Text
                size="base"
                color={theme.colors.grey[200]}
                textStyle={styles.bioText}
            >
                {bio}
            </Text>

            <View style={styles.section}>
                <Text size="sm" color={theme.colors.grey[300]}>
                    {ministryLabel}
                </Text>
                <Text size="2xl" weight="semiBold" color={theme.colors.white[50]}>
                    {ministryName}
                </Text>
            </View>

            <View style={styles.section}>
                <Text size="sm" color={theme.colors.grey[300]}>
                    {socialTitle}
                </Text>
                <View>
                    {socialLinks.map((item, index) => (
                        <Pressable
                            key={item.id}
                            onPress={() => onPressSocial?.(item)}
                            style={[
                                styles.socialRow,
                                index < socialLinks.length - 1 && styles.rowBorder,
                            ]}
                        >
                            <View style={styles.socialIcon}>
                                <SocialIcon
                                    id={item.id}
                                    fallbackText={item.iconText ?? item.label[0]}
                                />
                            </View>
                            <Text
                                size="base"
                                color={theme.colors.grey[100]}
                                numberOfLines={1}
                            >
                                {item.handle}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        </View>
    );
}

function SocialIcon({
    id,
    fallbackText,
}: {
    id: string;
    fallbackText: string;
}) {
    if (id === 'instagram') {
        return <InstagramIcon width={20} height={20} />;
    }
    if (id === 'x') {
        return <XSocialIcon width={20} height={20} />;
    }
    if (id === 'tiktok') {
        return <TikTokIcon width={20} height={20} />;
    }
    return (
        <Text size="xs" weight="semiBold" color={theme.colors.white[50]}>
            {fallbackText}
        </Text>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: theme.sizes.spacing.base,
        gap: theme.sizes.spacing.lg,
        backgroundColor: theme.colors.grey[800],
        paddingTop: theme.sizes.spacing.sm,
        paddingBottom: theme.sizes.spacing['2xl'],
    },
    topBar: {
        height: 42,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bioText: {
        lineHeight: 24,
    },
    section: {
        gap: theme.sizes.spacing.base,
    },
    socialRow: {
        minHeight: 36,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.base,
        paddingVertical: theme.sizes.spacing.xs,
    },
    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.grey[600],
    },
    socialIcon: {
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

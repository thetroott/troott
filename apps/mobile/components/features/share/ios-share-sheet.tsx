import React from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    type ImageSourcePropType,
} from 'react-native';
import { Copy, Heart, SearchNormal1, Link1, BookSaved, CloseCircle } from 'iconsax-react-nativejs';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { ShareActionItem, ShareTargetItem } from './share-types';

type IosShareSheetProps = {
    appLabel?: string;
    appIcon?: ImageSourcePropType;
    onClose?: () => void;
    shareTargets?: ShareTargetItem[];
    primaryAction?: ShareActionItem;
    secondaryActions?: ShareActionItem[];
    editActionsLabel?: string;
    onPressEditActions?: () => void;
};

const DEFAULT_APP_ICON = require('@/assets/images/tt/troott-logo.png');

const DEFAULT_TARGETS: ShareTargetItem[] = [
    { id: 'airdrop', label: 'AirDrop' },
    { id: 'mail', label: 'Mail' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'notes', label: 'Notes' },
    { id: 'facebook', label: 'Facebook' },
];

export default function IosShareSheet({
    appLabel = 'app.troott.com',
    appIcon = DEFAULT_APP_ICON,
    onClose,
    shareTargets = DEFAULT_TARGETS,
    primaryAction,
    secondaryActions,
    editActionsLabel = 'Edit Actions...',
    onPressEditActions,
}: IosShareSheetProps) {
    const resolvedPrimary = primaryAction ?? {
        id: 'copy-link',
        label: 'Copy Link',
        icon: <Copy size={20} color={theme.colors.white[50]} />,
    };

    const resolvedSecondary: ShareActionItem[] =
        secondaryActions ??
        [
            {
                id: 'reading-list',
                label: 'Add to Reading List',
                icon: <BookSaved size={20} color={theme.colors.white[50]} />,
            },
            {
                id: 'bookmark',
                label: 'Add Bookmark',
                icon: <BookSaved size={20} color={theme.colors.white[50]} />,
            },
            {
                id: 'favorites',
                label: 'Add to Favorites',
                icon: <Heart size={20} color={theme.colors.white[50]} />,
            },
            {
                id: 'find-page',
                label: 'Find on Page',
                icon: <SearchNormal1 size={20} color={theme.colors.white[50]} />,
            },
        ];

    return (
        <View style={styles.sheet}>
            <View style={styles.headerRow}>
                <View style={styles.appInfo}>
                    <View style={styles.appIconBox}>
                        <Image source={appIcon} style={styles.appIcon} />
                    </View>
                    <Text size="2xl" color={theme.colors.grey[100]}>
                        {appLabel}
                    </Text>
                </View>
                <Pressable style={styles.closeBtn} onPress={onClose}>
                    <CloseCircle size={20} color={theme.colors.grey[100]} />
                </Pressable>
            </View>

            <View style={styles.separator} />

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.targetsRow}
            >
                {shareTargets.map((target) => (
                    <Pressable
                        key={target.id}
                        style={styles.targetItem}
                        onPress={target.onPress}
                    >
                        <View style={styles.targetIcon}>
                            {target.iconSource ? (
                                <Image source={target.iconSource} style={styles.targetIconImage} />
                            ) : target.icon ? (
                                target.icon
                            ) : (
                                <Link1 size={30} color={theme.colors.white[50]} />
                            )}
                        </View>
                        <Text size="xs" color={theme.colors.white[50]} numberOfLines={1}>
                            {target.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            <View style={styles.separator} />

            <ActionCard items={[resolvedPrimary]} />
            <ActionCard items={resolvedSecondary} />

            <Pressable onPress={onPressEditActions} style={styles.editWrap}>
                <Text size="2xl" color="#007AFF">
                    {editActionsLabel}
                </Text>
            </Pressable>
        </View>
    );
}

function ActionCard({ items }: { items: ShareActionItem[] }) {
    return (
        <View style={styles.card}>
            {items.map((item, index) => (
                <Pressable key={item.id} onPress={item.onPress} style={styles.actionRow}>
                    <Text size="3xl" color={theme.colors.white[50]}>
                        {item.label}
                    </Text>
                    <View style={styles.actionIcon}>{item.icon}</View>
                    {index < items.length - 1 ? <View style={styles.rowDivider} /> : null}
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    sheet: {
        width: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        backgroundColor: '#1C1C1E',
        paddingHorizontal: theme.sizes.spacing.base,
        paddingTop: theme.sizes.spacing.base,
        paddingBottom: theme.sizes.spacing['2xl'],
        gap: theme.sizes.spacing.base,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    appInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.md,
    },
    appIconBox: {
        width: 40,
        height: 40,
        borderRadius: 1,
        backgroundColor: '#2C2C2E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    appIcon: {
        width: 20,
        height: 20,
    },
    closeBtn: {
        width: 30,
        height: 30,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: '#2C2C2E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(84,84,88,0.65)',
    },
    targetsRow: {
        gap: theme.sizes.spacing.lg,
        paddingVertical: theme.sizes.spacing.sm,
    },
    targetItem: {
        width: 62,
        alignItems: 'center',
        gap: 8,
    },
    targetIcon: {
        width: 60,
        height: 60,
        borderRadius: 13,
        backgroundColor: '#2C2C2E',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    targetIconImage: {
        width: 60,
        height: 60,
    },
    card: {
        borderRadius: 13,
        overflow: 'hidden',
        backgroundColor: '#2C2C2E',
    },
    actionRow: {
        minHeight: 48,
        justifyContent: 'center',
        paddingHorizontal: theme.sizes.spacing.base,
        paddingRight: 48,
    },
    actionIcon: {
        position: 'absolute',
        right: theme.sizes.spacing.base,
        top: 12,
    },
    rowDivider: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(60,60,67,0.36)',
    },
    editWrap: {
        minHeight: 30,
        justifyContent: 'center',
    },
});

import React from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import {
    Copy,
    Heart,
    Link1,
    More,
    SearchNormal1,
    BookSaved,
} from 'iconsax-react-nativejs';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { ShareActionItem, ShareTargetItem } from './share-types';

type AndroidShareSheetProps = {
    title?: string;
    shareTargets?: ShareTargetItem[];
    quickActions?: ShareActionItem[];
    onPressMore?: () => void;
};

const DEFAULT_TARGETS: ShareTargetItem[] = [
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'telegram', label: 'Telegram' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'copy', label: 'Copy link' },
];

const DEFAULT_QUICK_ACTIONS: ShareActionItem[] = [
    { id: 'copy', label: 'Copy link', icon: <Copy size={20} color={theme.colors.white[50]} /> },
    {
        id: 'reading-list',
        label: 'Add to reading list',
        icon: <BookSaved size={20} color={theme.colors.white[50]} />,
    },
    { id: 'bookmark', label: 'Bookmark', icon: <BookSaved size={20} color={theme.colors.white[50]} /> },
    { id: 'favorite', label: 'Add to favorites', icon: <Heart size={20} color={theme.colors.white[50]} /> },
    { id: 'find', label: 'Find on page', icon: <SearchNormal1 size={20} color={theme.colors.white[50]} /> },
];

export default function AndroidShareSheet({
    title = 'Share',
    shareTargets = DEFAULT_TARGETS,
    quickActions = DEFAULT_QUICK_ACTIONS,
    onPressMore,
}: AndroidShareSheetProps) {
    return (
        <View style={styles.sheet}>
            <View style={styles.dragger} />
            <Text size="lg" weight="semiBold" color={theme.colors.white[50]}>
                {title}
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.targetsRow}
            >
                {shareTargets.map((target) => (
                    <Pressable
                        key={target.id}
                        onPress={target.onPress}
                        style={styles.targetItem}
                    >
                        <View style={styles.targetIcon}>
                            {target.icon ?? <Link1 size={26} color={theme.colors.white[50]} />}
                        </View>
                        <Text size="xs" color={theme.colors.white[50]} numberOfLines={1}>
                            {target.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            <View style={styles.list}>
                {quickActions.map((action) => (
                    <Pressable
                        key={action.id}
                        onPress={action.onPress}
                        style={styles.actionRow}
                    >
                        <View style={styles.rowIcon}>{action.icon}</View>
                        <Text size="sm" color={theme.colors.white[50]}>
                            {action.label}
                        </Text>
                    </Pressable>
                ))}
                <Pressable onPress={onPressMore} style={styles.actionRow}>
                    <View style={styles.rowIcon}>
                        <More size={20} color={theme.colors.white[50]} />
                    </View>
                    <Text size="sm" color={theme.colors.white[50]}>
                        More options
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sheet: {
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#171717',
        paddingHorizontal: theme.sizes.spacing.base,
        paddingTop: theme.sizes.spacing.base,
        paddingBottom: theme.sizes.spacing['2xl'],
        gap: theme.sizes.spacing.base,
    },
    dragger: {
        width: 56,
        height: 4,
        borderRadius: theme.sizes.radius.full,
        alignSelf: 'center',
        backgroundColor: theme.colors.grey[300],
    },
    targetsRow: {
        gap: theme.sizes.spacing.md,
        paddingVertical: theme.sizes.spacing.sm,
    },
    targetItem: {
        width: 72,
        alignItems: 'center',
        gap: theme.sizes.spacing.xs,
    },
    targetIcon: {
        width: 56,
        height: 56,
        borderRadius: theme.sizes.radius.md,
        backgroundColor: '#2C2C2E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        borderRadius: theme.sizes.radius.md,
        backgroundColor: '#2C2C2E',
        overflow: 'hidden',
    },
    actionRow: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.md,
        paddingHorizontal: theme.sizes.spacing.base,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(60,60,67,0.36)',
    },
    rowIcon: {
        width: 24,
        alignItems: 'center',
    },
});

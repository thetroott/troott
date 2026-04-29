import React from 'react';
import {
    Image,
    Pressable,
    StyleSheet,
    View,
    type ImageSourcePropType,
} from 'react-native';
import { Link1, More } from 'iconsax-react-nativejs';
import InstagramIcon from '@/assets/icons/instagram.svg';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { ShareActionItem, ShareTrack } from './share-types';

type ListenerShareSheetProps = {
    track: ShareTrack;
    onShareInstagram?: () => void;
    onCopyToClipboard?: () => void;
    onMoreShareOptions?: () => void;
    actions?: ShareActionItem[];
};

const FALLBACK_ARTWORK = require('@/assets/images/cover.jpg');

export default function ListenerShareSheet({
    track,
    onShareInstagram,
    onCopyToClipboard,
    onMoreShareOptions,
    actions,
}: ListenerShareSheetProps) {
    const resolvedActions: ShareActionItem[] =
        actions ??
        [
            {
                id: 'instagram',
                label: 'Share to Instagram Feed',
                icon: <InstagramIcon width={24} height={24} />,
                onPress: onShareInstagram,
            },
            {
                id: 'copy',
                label: 'Copy to clipboard',
                icon: <Link1 size={24} color={theme.colors.white[50]} />,
                onPress: onCopyToClipboard,
            },
            {
                id: 'more',
                label: 'More Share Options',
                icon: <More size={24} color={theme.colors.white[50]} />,
                onPress: onMoreShareOptions,
            },
        ];

    return (
        <View style={styles.container}>
            <View style={styles.handle} />

            <View style={styles.trackRow}>
                <Image source={resolveArtwork(track)} style={styles.artwork} />
                <View style={styles.trackMeta}>
                    <Text size="lg" weight="semiBold" color={theme.colors.white[50]}>
                        {track.title ?? 'Untitled'}
                    </Text>
                    <Text size="lg" color={theme.colors.grey[200]}>
                        {track.minister ?? 'Unknown minister'}
                    </Text>
                </View>
            </View>

            <View style={styles.actions}>
                {resolvedActions.map((item) => (
                    <Pressable
                        key={item.id}
                        style={styles.actionRow}
                        onPress={item.onPress}
                    >
                        <View style={styles.iconWrap}>{item.icon}</View>
                        <Text size="md" color={theme.colors.white[50]}>
                            {item.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
            <View style={styles.homeIndicator} />
        </View>
    );
}

function resolveArtwork(track: ShareTrack): ImageSourcePropType {
    const art = track.image ?? track.artwork;
    if (typeof art === 'number') return art;
    if (typeof art === 'string' && art.length > 0) return { uri: art };
    return FALLBACK_ARTWORK;
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: '#292929',
        paddingBottom: theme.sizes.spacing.lg,
    },
    handle: {
        marginTop: 5,
        alignSelf: 'center',
        width: 95,
        height: 5,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: 'rgba(235,235,245,0.3)',
    },
    trackRow: {
        paddingHorizontal: theme.sizes.spacing.base,
        paddingTop: theme.sizes.spacing.lg,
        paddingBottom: theme.sizes.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.md,
    },
    artwork: {
        width: 65,
        height: 65,
        borderRadius: 2,
        backgroundColor: theme.colors.grey[700],
    },
    trackMeta: {
        gap: theme.sizes.spacing.xs,
    },
    actions: {
        paddingBottom: theme.sizes.spacing.base,
    },
    actionRow: {
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.md,
        paddingHorizontal: theme.sizes.spacing.base,
    },
    iconWrap: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    homeIndicator: {
        alignSelf: 'center',
        width: 134,
        height: 5,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: theme.colors.white[50],
        marginTop: theme.sizes.spacing.sm,
    },
});

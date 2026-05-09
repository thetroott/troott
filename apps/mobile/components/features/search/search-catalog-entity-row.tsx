import React from 'react';
import {
    Image,
    Pressable,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';

import Text from '@/components/ui/text';
import { SolidIcons } from '@/assets/icons';
import { theme } from '@/constants/theme';

const ARTWORK = 56;
const RADIUS_SQUARE = 4;

export type SearchCatalogEntityRowLayout = 'shell' | 'list';

type Props = {
    title: string;
    subtitle?: string;
    imageUri?: string | null;
    /** Square artwork (sermons/playlists) vs circular (ministers). */
    imageShape: 'square' | 'circle';
    onPress: () => void;
    /** Shown for parity with {@link SermonCard} small rows; optional handler. */
    onMenuPress?: () => void;
    layout?: SearchCatalogEntityRowLayout;
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
};

/**
 * Unified search result row aligned with {@link SermonCard} `variant="small"` layout
 * (56px artwork, title + subtitle, trailing ellipsis).
 */
export default function SearchCatalogEntityRow({
    title,
    subtitle,
    imageUri,
    imageShape,
    onPress,
    onMenuPress,
    layout = 'list',
    style,
    accessibilityLabel,
}: Props) {
    const isShell = layout === 'shell';

    const artwork =
        imageUri != null && imageUri.length > 0 ? (
            <Image
                source={{ uri: imageUri }}
                style={
                    imageShape === 'circle'
                        ? styles.artCircle
                        : styles.artSquare
                }
                accessibilityIgnoresInvertColors
            />
        ) : (
            <View
                style={[
                    imageShape === 'circle' ? styles.artCircle : styles.artSquare,
                    styles.artPlaceholder,
                ]}
            />
        );

    const subtitleLine = subtitle?.trim();

    return (
        <Pressable
            style={[styles.row, isShell ? styles.rowShell : styles.rowList, style]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? title}
        >
            <View style={styles.titleBlock}>
                {artwork}
                <View style={styles.textCol}>
                    <Text
                        size="sm"
                        weight="medium"
                        color={theme.colors.white[50]}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                    {subtitleLine ? (
                        <Text
                            size="xs"
                            color={theme.colors.grey[300]}
                            numberOfLines={2}
                        >
                            {subtitleLine}
                        </Text>
                    ) : null}
                </View>
            </View>
            {onMenuPress != null ? (
                <Pressable
                    onPress={(e) => {
                        e.stopPropagation();
                        onMenuPress();
                    }}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="More actions"
                >
                    <SolidIcons.EllipsisVerticalIcon
                        size={20}
                        color={theme.colors.grey[400]}
                    />
                </Pressable>
            ) : (
                <View pointerEvents="none" accessibilityElementsHidden>
                    <SolidIcons.EllipsisVerticalIcon
                        size={20}
                        color={theme.colors.grey[400]}
                    />
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    rowShell: {
        paddingBottom: theme.sizes.spacing.sm,
    },
    rowList: {
        paddingVertical: theme.sizes.spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.grey[700],
    },
    titleBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.md,
        flex: 1,
        minWidth: 0,
    },
    textCol: {
        flex: 1,
        minWidth: 0,
        gap: theme.sizes.spacing.xs,
    },
    artSquare: {
        width: ARTWORK,
        height: ARTWORK,
        borderRadius: RADIUS_SQUARE,
    },
    artCircle: {
        width: ARTWORK,
        height: ARTWORK,
        borderRadius: ARTWORK / 2,
    },
    artPlaceholder: {
        backgroundColor: theme.colors.grey[700],
    },
});

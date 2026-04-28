import { Add, TickCircle } from 'iconsax-react-nativejs';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

import type { ChoosePlaylistListItem } from './playlist-choose-types';

export type ChoosePlaylistSheetProps = {
    playlists: ChoosePlaylistListItem[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    /** Strips outer chrome when nested inside another bottom sheet. */
    embeddedInBottomSheet?: boolean;
};

/**
 * Bottom sheet: choose an existing playlist or create a new one.
 * "New playlist" opens the create playlist screen.
 * Figma: 8869-63752, 8907-23243
 */
export default function ChoosePlaylistSheet({
    playlists,
    selectedId,
    onSelect,
    embeddedInBottomSheet = false,
}: ChoosePlaylistSheetProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.sheet,
                embeddedInBottomSheet && styles.sheetEmbedded,
                { paddingBottom: Math.max(insets.bottom, theme.sizes.spacing.md) },
            ]}
        >
            <View style={styles.header}>
                <Text
                    size="sm"
                    weight="medium"
                    color={theme.colors.grey[100]}
                >
                    Choose a playlist
                </Text>
                <Pressable
                    style={styles.newPlaylistBtn}
                    onPress={() => {
                        router.push('/playlist/create-playlist');
                    }}
                    hitSlop={8}
                >
                    <Add
                        size={20}
                        color={theme.colors.teal[500]}
                        variant="Outline"
                    />
                    <Text
                        size="sm"
                        weight="medium"
                        color={theme.colors.teal[500]}
                    >
                        New playlist
                    </Text>
                </Pressable>
            </View>

            <View style={styles.list}>
                {playlists.map((row) => {
                    const selected = row.id === selectedId;
                    return (
                        <Pressable
                            key={row.id}
                            style={styles.row}
                            onPress={() => onSelect(row.id)}
                        >
                            <Text
                                size="sm"
                                color={theme.colors.grey[50]}
                                textStyle={styles.rowLabel}
                            >
                                {row.title}
                            </Text>
                            {selected ? (
                                <TickCircle
                                    size={20}
                                    color={theme.colors.white[50]}
                                    variant="Bold"
                                />
                            ) : (
                                <View style={styles.checkPlaceholder} />
                            )}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sheet: {
        backgroundColor: theme.colors.grey[900],
        borderTopLeftRadius: theme.sizes.radius.lg,
        borderTopRightRadius: theme.sizes.radius.lg,
    },
    sheetEmbedded: {
        backgroundColor: 'transparent',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.sizes.spacing.lg,
        paddingVertical: theme.sizes.spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(84, 84, 84, 0.5)',
    },
    newPlaylistBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.xs,
    },
    list: {
        paddingHorizontal: theme.sizes.spacing.lg,
        paddingTop: theme.sizes.spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.sizes.spacing.md,
    },
    rowLabel: {
        flex: 1,
    },
    checkPlaceholder: {
        width: 20,
        height: 20,
    },
});

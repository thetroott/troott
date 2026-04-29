import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ArrowRight2 } from 'iconsax-react-nativejs';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { ProfileMenuItem } from './types';

type ProfileMenuItemProps = {
    item: ProfileMenuItem;
    withBorder?: boolean;
};

export default function ProfileMenuItemRow({
    item,
    withBorder = false,
}: ProfileMenuItemProps) {
    return (
        <Pressable
            onPress={item.onPress}
            style={[styles.row, withBorder && styles.rowBorder]}
        >
            <Text
                size="sm"
                weight="medium"
                color={
                    item.highlighted
                        ? theme.colors.teal[500]
                        : theme.colors.white[50]
                }
            >
                {item.label}
            </Text>
            <View style={styles.iconWrap}>
                <ArrowRight2
                    size={16}
                    color={
                        item.highlighted
                            ? theme.colors.teal[500]
                            : theme.colors.white[50]
                    }
                />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        height: 36,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.grey[600],
    },
    iconWrap: {
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { ProfileMenuItem } from './types';
import ProfileMenuItemRow from './profile-menu-item';

type ProfileSectionProps = {
    items: ProfileMenuItem[];
};

export default function ProfileSection({ items }: ProfileSectionProps) {
    return (
        <View style={styles.section}>
            {items.map((item, index) => (
                <ProfileMenuItemRow
                    key={item.id}
                    item={item}
                    withBorder={index !== items.length - 1}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: theme.sizes.spacing.sm,
    },
});

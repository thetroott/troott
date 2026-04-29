import React from 'react';
import { StyleSheet, View } from 'react-native';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

type ShareCopyToastProps = {
    label?: string;
};

export default function ShareCopyToast({
    label = 'Link copied to your clipboard',
}: ShareCopyToastProps) {
    return (
        <View style={styles.wrap}>
            <View style={styles.toast}>
                <Text size="sm" color={theme.colors.white[50]}>
                    {label}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        width: '100%',
        paddingHorizontal: 8,
        paddingBottom: 50,
    },
    toast: {
        minHeight: 52,
        borderRadius: 6,
        backgroundColor: '#3A3636',
        justifyContent: 'center',
        paddingHorizontal: theme.sizes.spacing.base,
    },
});

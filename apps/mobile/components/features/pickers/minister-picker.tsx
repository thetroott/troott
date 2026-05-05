import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import { CloseCircle } from 'iconsax-react-nativejs';

import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

export type MinisterPickerProps = {
    title: string;
    subtitle?: string;
    searchPlaceholder: string;
    minSelection?: number;
    primaryLabel: string;
    onPrimaryPress: () => void;
    showClose?: boolean;
    onClose?: () => void;
};

/**
 * Minister selection shell (search + follow action). Wire to ministers API when ready.
 */
export default function MinisterPicker({
    title,
    subtitle,
    searchPlaceholder,
    primaryLabel,
    onPrimaryPress,
    showClose,
    onClose,
}: MinisterPickerProps) {
    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.headerRow}>
                <Text weight="semiBold" size="xl" color={theme.colors.white[50]}>
                    {title}
                </Text>
                {showClose ? (
                    <Pressable onPress={onClose} hitSlop={12}>
                        <CloseCircle
                            size={26}
                            color={theme.colors.white[50]}
                            variant="Outline"
                        />
                    </Pressable>
                ) : null}
            </View>
            {subtitle ? (
                <Text color={theme.colors.grey[400]} size="sm">
                    {subtitle}
                </Text>
            ) : null}
            <Input placeholder={searchPlaceholder} />
            <View style={styles.spacer} />
            <Button label={primaryLabel} onPress={onPrimaryPress} />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, gap: theme.sizes.spacing.md },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    spacer: { flex: 1 },
});

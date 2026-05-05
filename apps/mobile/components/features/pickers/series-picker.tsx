import React from 'react';
import {
    ActivityIndicator,
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

export type SeriesPickerProps = {
    title: string;
    searchPlaceholder: string;
    primaryLabel: string;
    showClose?: boolean;
    onClose?: () => void;
    loading?: boolean;
    loadingTitle?: string;
    onPrimaryPress: () => void | Promise<void>;
};

/**
 * Series selection shell (search + primary action). Wire to catalogue APIs when ready.
 */
export default function SeriesPicker({
    title,
    searchPlaceholder,
    primaryLabel,
    showClose,
    onClose,
    loading,
    loadingTitle = 'Loading',
    onPrimaryPress,
}: SeriesPickerProps) {
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
            <Input placeholder={searchPlaceholder} editable={!loading} />
            <View style={styles.spacer} />
            {loading ? (
                <View style={styles.loading}>
                    <ActivityIndicator color={theme.colors.teal[400]} />
                    <Text color={theme.colors.grey[400]}>{loadingTitle}</Text>
                </View>
            ) : null}
            <Button label={primaryLabel} onPress={() => void onPrimaryPress()} />
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
    loading: {
        alignItems: 'center',
        gap: theme.sizes.spacing.sm,
    },
});

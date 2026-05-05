import React from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    View,
    useWindowDimensions,
} from 'react-native';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

const IOS_ACTION_BLUE = '#0a84ff';

type Props = {
    visible: boolean;
    onDismiss: () => void;
    onConfirmClear: () => void;
};

/** Matches Figma Alert-Modal (5566:15317) for clearing recent searches. */
export default function ClearRecentSearchesDialog({
    visible,
    onDismiss,
    onConfirmClear,
}: Props) {
    const { width: screenW } = useWindowDimensions();
    const cardWidth = Math.min(273, Math.round(screenW * 0.85));

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onDismiss}
            statusBarTranslucent
        >
            <View style={styles.root} accessibilityViewIsModal>
                <Pressable
                    style={styles.backdrop}
                    onPress={onDismiss}
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss"
                />
                <View style={[styles.card, { width: cardWidth }]}>
                    <View style={styles.content}>
                        <Text
                            size="md"
                            weight="medium"
                            color={theme.colors.white[50]}
                            style={styles.title}
                        >
                            Are you sure?
                        </Text>
                        <Text
                            size="sm"
                            weight="regular"
                            color={theme.colors.white[50]}
                            style={styles.body}
                        >
                            You won&apos;t be able to undo this.
                        </Text>
                    </View>
                    <View style={styles.actionsTopRule} />
                    <View style={styles.actionsRow}>
                        <Pressable
                            style={[styles.actionCell, styles.actionLeft]}
                            onPress={onDismiss}
                            accessibilityRole="button"
                            accessibilityLabel="Not now"
                        >
                            <Text
                                size="base"
                                weight="semiBold"
                                style={{ color: IOS_ACTION_BLUE }}
                            >
                                Not now
                            </Text>
                        </Pressable>
                        <Pressable
                            style={styles.actionCell}
                            onPress={onConfirmClear}
                            accessibilityRole="button"
                            accessibilityLabel="Clear recent searches"
                        >
                            <Text
                                size="base"
                                weight="semiBold"
                                color={theme.colors.red[500]}
                            >
                                Clear
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.sizes.spacing.lg,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    card: {
        borderRadius: 14,
        backgroundColor: theme.colors.grey[700],
        overflow: 'hidden',
        zIndex: 1,
    },
    content: {
        paddingHorizontal: theme.sizes.spacing.base,
        paddingTop: theme.sizes.spacing.base,
        paddingBottom: theme.sizes.spacing.sm,
        minHeight: 81,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
    },
    body: {
        textAlign: 'center',
        marginTop: theme.sizes.spacing.xs,
    },
    actionsTopRule: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#545458',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        minHeight: 46,
    },
    actionCell: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: theme.sizes.spacing.sm,
    },
    actionLeft: {
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: 'rgba(84, 84, 88, 0.65)',
    },
});

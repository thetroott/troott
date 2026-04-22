import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

type DeleteAccountAlertProps = {
    visible: boolean;
    onClose: () => void;
    onConfirmDelete: () => void;
};

export default function DeleteAccountAlert({
    visible,
    onClose,
    onConfirmDelete,
}: DeleteAccountAlertProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={styles.alertCard}>
                    <View style={styles.content}>
                        <Text
                            size="lg"
                            weight="semiBold"
                            color={theme.colors.white[50]}
                            textStyle={styles.centerText}
                        >
                            Are you sure?
                        </Text>
                        <Text
                            size="sm"
                            color={theme.colors.white[50]}
                            textStyle={styles.description}
                        >
                            Deleting your account will permanently remove all your
                            saved sermons, playlists, and activity. This action
                            cannot be undone.
                        </Text>
                    </View>
                    <View style={styles.actions}>
                        <Pressable style={styles.action} onPress={onClose}>
                            <Text
                                size="lg"
                                weight="semiBold"
                                color="#0A84FF"
                                textStyle={styles.centerText}
                            >
                                Not now
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.action, styles.deleteAction]}
                            onPress={onConfirmDelete}
                        >
                            <Text
                                size="lg"
                                weight="semiBold"
                                color={theme.colors.red[500]}
                                textStyle={styles.centerText}
                            >
                                Delete
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    alertCard: {
        width: 273,
        borderRadius: 14,
        backgroundColor: '#252525',
        overflow: 'hidden',
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 2,
    },
    centerText: {
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        lineHeight: 18,
    },
    actions: {
        height: 46,
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#545458',
    },
    action: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteAction: {
        borderLeftWidth: 1,
        borderLeftColor: '#545458',
    },
});

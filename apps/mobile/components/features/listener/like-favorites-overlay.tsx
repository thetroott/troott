import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import LikeFavoritesAlert, {
    type LikeFavoritesAlertProps,
} from './like-favorites-alert';

export type LikeFavoritesOverlayProps = LikeFavoritesAlertProps & {
    visible: boolean;
    onDismiss?: () => void;
};

export default function LikeFavoritesOverlay({
    visible,
    onDismiss,
    ...alertProps
}: LikeFavoritesOverlayProps) {
    if (!visible) return null;

    return (
        <View style={styles.overlay} pointerEvents="box-none">
            <Pressable
                style={styles.backdrop}
                onPress={onDismiss}
                accessibilityRole="button"
                accessibilityLabel="Dismiss favorites prompt"
            />
            <View style={styles.cardWrap} pointerEvents="box-none">
                <LikeFavoritesAlert
                    {...alertProps}
                    onPressAction={alertProps.onPressAction ?? onDismiss}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 300,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.62)',
    },
    cardWrap: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
});

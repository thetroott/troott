import { Pressable, StyleSheet, View } from 'react-native';
import React from 'react';
import { SolidIcons } from '@/assets/icons';
import { theme } from '@/constants/theme';
import { useDismissFullPlayer } from '@/hooks/player/use-dismiss-full-player';

const TrackDetailsHeader = () => {
    const dismiss = useDismissFullPlayer();

    return (
        <View style={styles.container}>
            <Pressable
                onPress={dismiss}
                accessibilityRole="button"
                accessibilityLabel="Close player"
            >
                <SolidIcons.ChevronDownIcon
                    size={theme.sizes.spacing.md}
                    color="#fff"
                />
            </Pressable>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="More options"
            >
                <SolidIcons.EllipsisHorizontalIcon
                    size={theme.sizes.spacing.lg}
                    color="#fff"
                />
            </Pressable>
        </View>
    );
};

export default TrackDetailsHeader;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.sizes.spacing.md,
    },
});

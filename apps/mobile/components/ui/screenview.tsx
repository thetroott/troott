import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import React from 'react';
import { theme } from '@/constants/theme';

// Root `_layout` already uses `SafeAreaView`; avoid nesting a second one (double top inset).
interface ScreenViewProps extends ViewProps {
    children: React.ReactNode;
    screenStyle?: ViewStyle;
}

const ScreenView = ({ children, screenStyle, style, ...props }: ScreenViewProps) => {
    return (
        <View
            {...props}
            style={[styles.container, style, screenStyle]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: theme.sizes.spacing.md,
        gap: theme.sizes.spacing.lg,
        flex: 1,
    },
});
export default ScreenView;

import { StyleSheet, View } from 'react-native';
import React from 'react';
import Text from '../../ui/text';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';

interface HeaderProps {
    title?: string;
    variant?: 'auth' | 'home' | 'playlist';
    rightElement?: React.ReactNode;
    leftElement?: React.ReactNode;
    centerElement?: React.ReactNode;
}

const Header = ({
    title,
    variant,
    rightElement,
    leftElement,
    centerElement,
}: HeaderProps) => {
    if (variant === 'playlist') {
        return (
            <View
                style={{
                    ...styles.container,
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}
            >
                {rightElement && rightElement}
                <Text
                    weight="semiBold"
                    size="md"
                    color={theme.colors.white[50]}
                >
                    {title}
                </Text>
                {leftElement && leftElement}
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <Text weight="semiBold" size="md" color={theme.colors.white[50]}>
                {title}
            </Text>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        height: theme.sizes.spacing['2xl'],
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.grey[800],
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrow: {
        position: 'absolute',
        left: 0,
        backgroundColor: 'transparent',
        width: '0%',
        height: 'auto',
    },
});

export default Header;

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Notification } from 'iconsax-react-nativejs';

interface UserWelcomeProps {
    firstName: string;
}

const UserWelcome: React.FC<UserWelcomeProps> = ({ firstName }) => {
    const [action, setAction] = useState('');

    useEffect(() => {
        const updateAction = () => {
            const hour = new Date().getHours();
            if (hour < 12) {
                setAction('Start listening');
            } else {
                setAction('Continue listening');
            }
        };

        updateAction();
    }, []);

    return (
        <View style={styles.root}>
            <View style={styles.row}>
                <View style={styles.titleSlot}>
                    <Text
                        size="xl"
                        weight="medium"
                        color={theme.colors.white[100]}
                        numberOfLines={1}
                    >
                        Hi, {firstName}!
                    </Text>
                </View>
                <Pressable
                    style={styles.iconSlot}
                    accessibilityRole="button"
                    accessibilityLabel="Notifications"
                    hitSlop={8}
                >
                    <Notification
                        color={theme.colors.grey[100]}
                        size={28}
                        variant="Bold"
                    />
                </Pressable>
            </View>
            <Text
                style={styles.actionText}
                size="base"
                color={theme.colors.grey[300]}
            >
                {action}
            </Text>
        </View>
    );
};

export default UserWelcome;

const styles = StyleSheet.create({
    root: {
        width: '100%',
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleSlot: {
        flex: 1,
        minWidth: 0,
        paddingRight: theme.sizes.spacing.sm,
    },
    iconSlot: {
        flexShrink: 0,
    },
    actionText: {
        marginTop: theme.sizes.spacing.xs,
        paddingBottom: theme.sizes.spacing.md,
    },
});

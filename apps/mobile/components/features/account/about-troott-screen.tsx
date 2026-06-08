import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { ArrowLeft2, ArrowUp } from 'iconsax-react-nativejs';
import { router } from 'expo-router';

import ScreenView from '@/components/ui/screenview';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import DeleteAccountAlert from './delete-account-alert';
import { useAuth } from '@/api/hooks/app/useAuth';
import api from '@/api/api';
import { toast } from '@/components/ui/toast';

type AboutRowProps = {
    label: string;
    value?: string;
    onPress?: () => void;
    external?: boolean;
};

function AboutRow({ label, value, onPress, external }: AboutRowProps) {
    return (
        <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
            <Text size="base" weight="medium" color={theme.colors.white[50]}>
                {label}
            </Text>
            {value ? (
                <Text size="base" color={theme.colors.grey[300]}>
                    {value}
                </Text>
            ) : external ? (
                <ArrowUp
                    size={18}
                    color={theme.colors.white[50]}
                    style={styles.externalLinkIcon}
                />
            ) : null}
        </Pressable>
    );
}

export default function AboutTroottScreen() {
    const [showDeleteAlert, setShowDeleteAlert] = React.useState(false);
    const { LogoutMutation } = useAuth();

    const confirmLogout = () => {
        Alert.alert('Log out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log out',
                style: 'destructive',
                onPress: () => LogoutMutation.mutate(),
            },
        ]);
    };

    const handleDeleteAccount = async () => {
        try {
            const res = await api.user.deleteMe();
            if (res.error) {
                toast.error(res.message || 'Could not delete account');
                return;
            }
            setShowDeleteAlert(false);
            toast.success('Account scheduled for deletion');
            LogoutMutation.mutate();
        } catch (e) {
            const msg =
                e instanceof Error ? e.message : 'Could not delete account';
            toast.error(msg);
        }
    };

    return (
        <ScreenView screenStyle={styles.screen}>
            <View style={styles.header}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft2 size={20} color={theme.colors.grey[300]} />
                </Pressable>
                <Text
                    size="lg"
                    weight="semiBold"
                    color={theme.colors.white[50]}
                >
                    About
                </Text>
            </View>

            <View style={styles.content}>
                <AboutRow
                    label="App version"
                    value={Constants.expoConfig?.version ?? '—'}
                />
                <AboutRow
                    label="Privacy policy"
                    external
                    onPress={() =>
                        void Linking.openURL('https://www.troott.com/privacy')
                    }
                />
                <AboutRow
                    label="Terms of use"
                    external
                    onPress={() =>
                        void Linking.openURL('https://www.troott.com/terms')
                    }
                />
                <AboutRow
                    label="Change password"
                    onPress={() => router.push('/user/change-password')}
                />
                <AboutRow
                    label="Taste preferences"
                    onPress={() => router.push('/(onboarding)/select-ministers')}
                />
                <AboutRow
                    label="Delete account"
                    onPress={() => setShowDeleteAlert(true)}
                />
            </View>

            <Pressable
                style={styles.logoutBtn}
                onPress={confirmLogout}
                disabled={LogoutMutation.isPending}
                accessibilityRole="button"
                accessibilityLabel="Log out"
            >
                <Text size="sm" color={theme.colors.red[500]}>
                    {LogoutMutation.isPending ? 'Logging out…' : 'Log out'}
                </Text>
            </Pressable>

            <DeleteAccountAlert
                visible={showDeleteAlert}
                onClose={() => setShowDeleteAlert(false)}
                onConfirmDelete={() => {
                    void handleDeleteAccount();
                }}
            />
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: theme.colors.black[50],
        paddingHorizontal: 0,
        gap: 0,
    },
    header: {
        height: 74,
        backgroundColor: '#1D1D1D',
        borderBottomWidth: 1,
        borderBottomColor: '#292929',
        paddingHorizontal: theme.sizes.spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.sm,
    },
    backBtn: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        marginTop: 24,
        paddingHorizontal: theme.sizes.spacing.base,
        gap: 12,
    },
    row: {
        minHeight: 36,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    externalLinkIcon: {
        transform: [{ rotate: '45deg' }],
    },
    logoutBtn: {
        marginTop: 24,
        alignSelf: 'center',
        width: 108,
        height: 30,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.red[500],
        alignItems: 'center',
        justifyContent: 'center',
    },
});

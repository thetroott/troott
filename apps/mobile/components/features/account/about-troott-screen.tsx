import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { ArrowLeft2, ArrowUp } from 'iconsax-react-nativejs';
import { router } from 'expo-router';

import ScreenView from '@/components/ui/screenview';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import DeleteAccountAlert from './delete-account-alert';

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
                <AboutRow label="App version" value="00.01.00" />
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
                    label="Delete account"
                    onPress={() => setShowDeleteAlert(true)}
                />
            </View>

            <Pressable style={styles.logoutBtn}>
                <Text size="sm" color={theme.colors.red[500]}>
                    Log out
                </Text>
            </Pressable>

            <DeleteAccountAlert
                visible={showDeleteAlert}
                onClose={() => setShowDeleteAlert(false)}
                onConfirmDelete={() => setShowDeleteAlert(false)}
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
    footerText: {
        marginTop: 24,
        textAlign: 'center',
        lineHeight: 19,
        paddingHorizontal: theme.sizes.spacing.base,
    },
});

import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';

import ScreenView from '@/components/ui/screenview';
import Text from '@/components/ui/text';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { theme } from '@/constants/theme';
import api from '@/api/api';

/**
 * Accept listener email invite: `POST /listener/invite/accept`
 * Open with query params: `?token=...&email=...`
 */
export default function AcceptInviteScreen() {
    const { token, email } = useLocalSearchParams<{
        token?: string;
        email?: string;
    }>();
    const [password, setPassword] = useState('');
    const inviteEmail = useMemo(
        () => String(email ?? '').trim().toLowerCase(),
        [email],
    );
    const inviteToken = useMemo(() => String(token ?? '').trim(), [token]);

    const accept = useMutation({
        mutationFn: () =>
            api.listener.acceptListenerInvitation({
                token: inviteToken,
                email: inviteEmail,
                password,
            }),
    });

    const canSubmit =
        inviteEmail.length > 0 &&
        inviteToken.length > 0 &&
        password.length >= 8 &&
        !accept.isPending;

    return (
        <ScreenView screenStyle={styles.screen}>
            <Text weight="semiBold" size="2xl" color={theme.colors.white[50]}>
                Accept invitation
            </Text>
            <Text size="sm" color={theme.colors.grey[300]}>
                Set a password to join Troott as a listener.
            </Text>
            <View style={styles.form}>
                <Text size="sm" color={theme.colors.grey[200]}>
                    {inviteEmail || 'Missing email in invite link'}
                </Text>
                <Input
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="Create password"
                />
                <Button
                    label={accept.isPending ? 'Joining…' : 'Join Troott'}
                    disabled={!canSubmit}
                    onPress={() => {
                        accept.mutate(undefined, {
                            onSuccess: (res) => {
                                if (res.error) {
                                    return;
                                }
                                router.replace('/login');
                            },
                        });
                    }}
                />
            </View>
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        gap: theme.sizes.spacing.md,
        padding: theme.sizes.spacing.base,
    },
    form: {
        gap: theme.sizes.spacing.md,
        marginTop: theme.sizes.spacing.lg,
    },
});

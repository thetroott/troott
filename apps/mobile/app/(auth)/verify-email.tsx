import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { router } from 'expo-router';

import ScreenView from '@/components/ui/screenview';
import { SharedHeader } from '@/components/features/shared';
import Text from '@/components/ui/text';
import VerifyEmailForm from '@/components/features/auth/forms/verify-email-otp';
import { theme } from '@/constants/theme';
import componentStyles from '@/assets/styles/components';
import { useRegisterAuth } from '@/context';
import storage from '@/api/services/mmkv-storage';

const VerifyEmailSignup = () => {
    const { email, setEmail, setField } = useRegisterAuth();
    const [displayEmail, setDisplayEmail] = useState(email?.trim() ?? '');

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            let resolved = email?.trim() ?? '';
            if (!resolved) {
                resolved = (await storage.getUserEmail()) || '';
            }
            if (cancelled || !resolved) return;
            setDisplayEmail(resolved);
            if (!email?.trim()) {
                setEmail(resolved);
                setField('email', resolved);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [email, setEmail, setField]);

    useEffect(() => {
        if (email?.trim()) {
            setDisplayEmail(email.trim());
        }
    }, [email]);

    return (
        <ScreenView>
            <SharedHeader title="Verify Email Address" />
            <Text style={componentStyles.termsSubText}>
                To verify email, we’ve sent a One Time Password (OTP) to{' '}
                {displayEmail || 'your email'}{' '}
                <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push('/enter-email')}
                >
                    <Text color={theme.colors.blue[300]} weight="semiBold">
                        (Change)
                    </Text>
                </Pressable>
            </Text>
            <VerifyEmailForm />
        </ScreenView>
    );
};

export default VerifyEmailSignup;

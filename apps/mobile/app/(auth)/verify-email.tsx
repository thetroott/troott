import React from 'react';

import ScreenView from '@/components/ui/screenview';
import { SharedHeader } from '@/components/features/shared';
import Text from '@/components/ui/text';
import VerifyEmailForm from '@/components/features/auth/forms/verify-email-otp';
import { theme } from '@/constants/theme';
import componentStyles from '@/assets/styles/components';

const VerifyEmailSignup = () => {
    return (
        <ScreenView>
            <SharedHeader title="Verify Email Address" />
            <Text style={componentStyles.termsSubText}>
                To verify email, we’ve sent a One Time Password (OTP) to
                justinchris@gmail.com{' '}
                <Text color={theme.colors.blue[300]} weight="semiBold">
                    (Change)
                </Text>
            </Text>
            <VerifyEmailForm />
        </ScreenView>
    );
};

export default VerifyEmailSignup;

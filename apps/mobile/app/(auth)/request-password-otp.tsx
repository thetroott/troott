import React from 'react';
import ScreenView from '@/components/ui/screenview';
import { SharedHeader } from '@/components/features/shared';
import ForgotPasswordOtpForm from '@/components/features/auth/forms/forgot-password-otp-form';

const ResetPasswordOTP = () => {
    return (
        <ScreenView>
            <SharedHeader title="Enter verification code" />
            <ForgotPasswordOtpForm />
        </ScreenView>
    );
};

export default ResetPasswordOTP;

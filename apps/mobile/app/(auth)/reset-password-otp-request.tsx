import React from 'react';
import ScreenView from '@/components/ui/screenview';
import { SharedHeader } from '@/components/features/shared';
import ForgotPasswordForm from '@/components/features/auth/forms/forgot-password-form';

const ResetPasswordOTPRequest = () => {
    return (
        <ScreenView>
            <SharedHeader title="Forgot password" />
            <ForgotPasswordForm />
        </ScreenView>
    );
};

export default ResetPasswordOTPRequest;

import React from 'react';
import ScreenView from '@/components/ui/screenview';
import { SharedHeader } from '@/components/features/shared';
import PasswordResetForm from '@/components/features/auth/forms/password-reset-form';

const ResetPassword = () => {
    return (
        <ScreenView>
            <SharedHeader title="Create new password" />
            <PasswordResetForm />
        </ScreenView>
    );
};

export default ResetPassword;

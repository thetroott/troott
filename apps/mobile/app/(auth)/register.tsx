import React from 'react';
import ScreenView from '@/components/ui/screenview';
import { SharedHeader } from '@/components/features/shared';
import SignUpform from '@/components/features/auth/forms/register-form';
const Register = () => {
    return (
        <ScreenView>
            <SharedHeader title="Create Account" />
            <SignUpform />
        </ScreenView>
    );
};

export default Register;

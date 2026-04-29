import React from 'react';
import { SharedHeader } from '@/components/features/shared';
import ScreenView from '@/components/ui/screenview';
import TermsAndConditions from '@/components/features/auth/TermsConditions';
import LoginForm from '@/components/features/auth/forms/login-form';

const Login = () => {
    return (
        <ScreenView>
            <SharedHeader title="Log in or Create Account" />
            <TermsAndConditions />
            <LoginForm />
        </ScreenView>
    );
};

export default Login;

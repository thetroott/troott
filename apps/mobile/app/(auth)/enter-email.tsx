import React from 'react';
import ScreenView from '@/components/ui/screenview';
import { SharedHeader } from '@/components/features/shared';
import EnterEmailForm from '@/components/features/auth/forms/enter-email-form';

const EnterEmail = () => {
    return (
        <ScreenView screenStyle={{ marginTop: 0 }}>
            <SharedHeader title="Enter your email" />
            <EnterEmailForm />
        </ScreenView>
    );
};

export default EnterEmail;

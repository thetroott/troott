import React from 'react';
import ScreenView from '@/components/ui/screenview';
import { SharedHeader } from '@/components/features/shared';

import TermsAndConditions from '@/components/features/auth/TermsConditions';

const ResetPasswordOTPRequest = () => {
    return (
        <ScreenView>
            <SharedHeader title="" />

            <TermsAndConditions />
        </ScreenView>
    );
};

export default ResetPasswordOTPRequest;

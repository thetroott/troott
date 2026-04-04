import React from "react";
import ScreenView from "@/components/layouts/screenview";
import { SharedHeader } from "@/components/containers/shared";

import TermsAndConditions from "@/components/containers/auth/TermsConditions";

const ResetPasswordOTPRequest = () => {
  return (
        <ScreenView>
      <SharedHeader title="" variant="auth" />
      
      <TermsAndConditions />
    </ScreenView>
  )
}

export default ResetPasswordOTPRequest
import React from "react";
import ScreenView from "@/components/layouts/screenview";
import { SharedHeader } from "@/components/containers/shared";

import TermsAndConditions from "@/components/containers/auth/TermsConditions";

const ResetPassword = () => {
  return (
        <ScreenView>
      <SharedHeader title="" />
      
      <TermsAndConditions />
    </ScreenView>
  )
}

export default ResetPassword
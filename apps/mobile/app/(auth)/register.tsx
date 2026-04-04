import React from "react";
import ScreenView from "@/components/layouts/screenview";
import { SharedHeader } from "@/components/containers/shared";
import SignUpform from "@/components/containers/auth/forms/register-form";

const Register = () => {
  return (
    <ScreenView>
      <SharedHeader title="Create Account" variant="auth" />
      <SignUpform />
    </ScreenView>
  );
};

export default Register;

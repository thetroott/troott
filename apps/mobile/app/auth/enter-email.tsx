import React from "react";
import ScreenView from "@/components/layouts/screenview";
import { SharedHeader } from "@/components/containers/shared";
import EnterEmailForm from "@/components/containers/auth/forms/enter-email-form";


const EnterEmail = () => {
  return (
    <ScreenView screenStyle={{marginTop: 0}}>
      <SharedHeader title="Enter your email" />
      <EnterEmailForm />
    </ScreenView>
  );
};

export default EnterEmail;

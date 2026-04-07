import React from 'react'
import { SharedHeader } from "@/components/containers/shared";
import ScreenView from "@/components/layouts/screenview";
import TermsAndConditions from "@/components/containers/auth/TermsConditions";
import LoginForm from '@/components/containers/auth/forms/login-form';


const Login = () => {
  return (
    <ScreenView >
      <SharedHeader title="Log in or Create Account"/>
       <TermsAndConditions/>
      <LoginForm/>
    </ScreenView>
  )
}

export default Login
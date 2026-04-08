import ResetPasswordForm from "@/components/shared/auth/reset-password";
import { AuthLayout } from "@/components/layouts/Authlayout";


const ResetPassword = () => {

  return (
    <>
      <AuthLayout
        title="Reset your password"
        description="Enter your new password below"
      >
        <ResetPasswordForm />
        
      </AuthLayout>
    </>
  );
};

export default ResetPassword;

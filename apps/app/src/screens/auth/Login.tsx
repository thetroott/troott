import { AuthLayout } from "@/components/layouts/Authlayout";
import LoginForm from "@/components/shared/auth/login-form";

const Login = () => {
  return (
    <>
      <AuthLayout
        title="Login to your account"
        description="Enter your email below to login to your account"
      >
        <LoginForm />
      </AuthLayout>
    </>
  );
};

export default Login;

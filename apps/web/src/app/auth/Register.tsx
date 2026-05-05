import { AuthLayout } from '@/components/layouts/Authlayout';
import RegisterForm from '@/components/shared/auth/register-form';

const Register = () => {
    return (
        <>
            <AuthLayout
                title="Create your account"
                description="Enter your information below to create your account"
                maxWidth="sm"
            >
                <RegisterForm />
            </AuthLayout>
        </>
    );
};

export default Register;

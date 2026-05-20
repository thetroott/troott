import { AuthLayout } from '@/components/layouts/Authlayout';
import RegisterForm from '@/components/shared/auth/register-form';
import { UserType } from '@/models/User.model';

const Register = () => {
    return (
        <>
            <AuthLayout
                title="Create your account"
                description="Enter your information below to create your account"
                maxWidth="sm"
            >
                <RegisterForm registrationUserType={UserType.MINISTER} />
            </AuthLayout>
        </>
    );
};

export default Register;

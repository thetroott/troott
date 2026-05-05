import ActivateUserForm from '@/components/shared/auth/activate-account';
import { AuthLayout } from '@/components/layouts/Authlayout';

const ActivateAccount = () => {
    return (
        <>
            <AuthLayout
                title="Enter activation code"
                description="We sent a 6-digit code to your email address"
            >
                <ActivateUserForm />
            </AuthLayout>
        </>
    );
};

export default ActivateAccount;

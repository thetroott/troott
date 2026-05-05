import { AuthLayout } from '@/components/layouts/Authlayout';
import OtpForm from '@/components/shared/auth/otp-form';

const Verification = () => {
    return (
        <>
            <AuthLayout
                title="Enter verification code"
                description="We sent a 6-digit code to your email address"
            >
                <OtpForm />
            </AuthLayout>
        </>
    );
};

export default Verification;

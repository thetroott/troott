import ChangePasswordForm from '@/components/features/profile/ChangePasswordForm';

const ChangePassword = () => {
    return (
        <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 text-[#eaeaea] md:px-6">
            <header>
                <h1 className="text-2xl font-semibold">Change password</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Update the password for your signed-in account.
                </p>
            </header>
            <ChangePasswordForm />
        </div>
    );
};

export default ChangePassword;

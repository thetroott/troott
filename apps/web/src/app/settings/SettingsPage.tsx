import { AccountInformationSection } from '@/components/features/settings/AccountInformationSection';
import { DeleteAccountSection } from '@/components/features/settings/DeleteAccountSection';
import { UpdatePasswordSection } from '@/components/features/settings/UpdatePasswordSection';

export default function SettingsPage() {
    return (
        <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 text-[#eaeaea] md:px-6">
            <header>
                <h1 className="text-2xl font-semibold">My Settings</h1>
                <p className="mt-1 text-sm text-[#bdbdbd]">
                    Manage your account information, password, and account
                    status.
                </p>
            </header>

            <div className="mx-auto flex w-full  flex-col gap-6">
                <AccountInformationSection />
                <UpdatePasswordSection />
                <DeleteAccountSection />
            </div>
        </div>
    );
}

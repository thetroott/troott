import { AccountInformationSection } from '@/components/features/settings/AccountInformationSection';
import { DeleteAccountSection } from '@/components/features/settings/DeleteAccountSection';
import { UpdatePasswordSection } from '@/components/features/settings/UpdatePasswordSection';
import { MY_SERMONS_PAGE } from '@/components/shared/my-sermons/my-sermons-ui';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    return (
        <div
            className={cn(
                MY_SERMONS_PAGE.pageBg,
                'flex min-h-0 flex-1 flex-col text-[#eaeaea]',
            )}
        >
        <div className={cn(MY_SERMONS_PAGE.mainColumn, 'space-y-6')}>
            <header>
                <h1 className="text-2xl font-semibold">My Settings</h1>
                <p className="mt-1 text-sm text-[#bdbdbd]">
                    Manage your account information, password, and account
                    status.
                </p>
            </header>

            <div className="flex w-full flex-col gap-6">
                <AccountInformationSection />
                <UpdatePasswordSection />
                <DeleteAccountSection />
            </div>
        </div>
        </div>
    );
}

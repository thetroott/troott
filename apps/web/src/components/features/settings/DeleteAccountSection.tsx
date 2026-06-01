import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import useAuth from '@/hooks/app/useAuth';
import { useDeactivateAccountMutation } from '@/hooks/app/useSettings';

import { DeleteAccountDialog } from './DeleteAccountDialog';
import { SettingsSectionCard } from './SettingsSectionCard';

export function DeleteAccountSection() {
    const { logout } = useAuth();
    const deactivate = useDeactivateAccountMutation();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleConfirmDelete = async () => {
        setSubmitting(true);
        try {
            await deactivate.mutateAsync();
            toast.success('Your account has been deactivated.');
            setDialogOpen(false);
            await logout();
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : 'Could not deactivate account.',
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <SettingsSectionCard
                title="Delete account"
                description="Permanently delete your account and all associated data. This action cannot be undone."
            >
                <Button
                    type="button"
                    variant="destructive"
                    disabled={submitting}
                    onClick={() => setDialogOpen(true)}
                    className="h-11 w-fit min-w-[140px]"
                >
                    Delete account
                </Button>
            </SettingsSectionCard>

            <DeleteAccountDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onConfirm={handleConfirmDelete}
                submitting={submitting}
            />
        </>
    );
}

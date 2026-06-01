import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentAccountQuery } from '@/hooks/app/useAccount';
import { useUpdateAccountMutation } from '@/hooks/app/useSettings';
import useContextType from '@/hooks/shared/useContextType';
import { useSession } from '@/context/session/sessionState';
import { SET_USER } from '@/context/types';
import type { EditUserDTO } from '@/dtos/user.dto';
import type { MapRegisteredUserDTO } from '@/dtos/auth.dto';

import { SettingsSectionCard } from './SettingsSectionCard';

type AccountForm = {
    firstName: string;
    lastName: string;
    email: string;
};

function toForm(data: unknown): AccountForm {
    const row = (data ?? {}) as Record<string, unknown>;
    return {
        firstName: String(row.firstName ?? ''),
        lastName: String(row.lastName ?? ''),
        email: String(row.email ?? ''),
    };
}

export function AccountInformationSection() {
    const { data, isLoading, isError } = useCurrentAccountQuery();
    const update = useUpdateAccountMutation();
    const { userContext } = useContextType();
    const { refreshSession } = useSession();
    const [values, setValues] = useState<AccountForm>({
        firstName: '',
        lastName: '',
        email: '',
    });
    const [initial, setInitial] = useState<AccountForm | null>(null);

    useEffect(() => {
        if (data) {
            const next = toForm(data);
            setValues(next);
            setInitial(next);
        }
    }, [data]);

    const dirty =
        initial !== null &&
        (values.firstName !== initial.firstName ||
            values.lastName !== initial.lastName ||
            values.email !== initial.email);

    const handleSave = async () => {
        if (!initial) {
            return;
        }

        const payload: EditUserDTO = {};
        if (values.firstName.trim() !== initial.firstName) {
            payload.firstName = values.firstName.trim();
        }
        if (values.lastName.trim() !== initial.lastName) {
            payload.lastName = values.lastName.trim();
        }
        if (values.email.trim().toLowerCase() !== initial.email) {
            payload.email = values.email.trim().toLowerCase();
        }

        if (Object.keys(payload).length === 0) {
            return;
        }

        try {
            await update.mutateAsync(payload);
            const next = {
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                email: values.email.trim().toLowerCase(),
            };
            setInitial(next);
            setValues(next);

            const sessionUser = userContext.user as MapRegisteredUserDTO | null;
            if (sessionUser) {
                userContext.setResource(SET_USER, {
                    ...sessionUser,
                    ...next,
                });
            }
            await refreshSession({ force: true });
            toast.success('Account information updated.');
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : 'Could not update account information.',
            );
        }
    };

    return (
        <SettingsSectionCard
            title="Profile information"
            description="Update your account's profile information and email address."
        >
            {isLoading ? (
                <p className="text-sm text-[#bdbdbd]">Loading account...</p>
            ) : isError ? (
                <p className="text-sm text-red-400" role="alert">
                    Could not load account information. Please refresh.
                </p>
            ) : (
                <div className="flex max-w-md flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="settings-first-name">First name</Label>
                        <Input
                            id="settings-first-name"
                            value={values.firstName}
                            onChange={(e) =>
                                setValues((prev) => ({
                                    ...prev,
                                    firstName: e.target.value,
                                }))
                            }
                            className="h-11 border-[#545454] bg-transparent text-[#eaeaea]"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="settings-last-name">Last name</Label>
                        <Input
                            id="settings-last-name"
                            value={values.lastName}
                            onChange={(e) =>
                                setValues((prev) => ({
                                    ...prev,
                                    lastName: e.target.value,
                                }))
                            }
                            className="h-11 border-[#545454] bg-transparent text-[#eaeaea]"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="settings-email">Email</Label>
                        <Input
                            id="settings-email"
                            type="email"
                            autoComplete="email"
                            value={values.email}
                            onChange={(e) =>
                                setValues((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                            className="h-11 border-[#545454] bg-transparent text-[#eaeaea]"
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={() => void handleSave()}
                        disabled={!dirty || update.isPending}
                        className="h-11 w-fit min-w-[120px] bg-[#eaeaea] text-[#1c1c1e] hover:bg-white"
                    >
                        {update.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save'
                        )}
                    </Button>
                </div>
            )}
        </SettingsSectionCard>
    );
}

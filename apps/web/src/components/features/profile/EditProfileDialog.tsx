import * as React from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ImageUploadTile } from './ImageUploadTile';
import {
    useUpdateProfileMutation,
} from '@/hooks/profile';
import {
    isMinisterProfile,
    mapFormValuesToUpdatePayload,
    mapProfileToFormValues,
    type ProfileDTO,
    type ProfileFormValues,
} from '@/app/profile/profile.types';

interface EditProfileDialogProps {
    profile: ProfileDTO;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const fieldLabel = 'block text-sm leading-5 text-[#eaeaea]';
const inputBase =
    'h-9 w-full rounded-md border border-[#545454]/50 bg-transparent px-2 text-sm text-[#eaeaea] placeholder:text-[#9d9d9d] focus-visible:border-[#08ffdb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/30';
const sectionTitle =
    'font-matter-medium text-base leading-6 text-[#eaeaea]';

/**
 * EditProfileDialog
 *
 * Implements Figma `11719:104736` (empty) and `11732:105889` (populated). The
 * same dialog component handles both states; the variant is implicit in the
 * presence of `value` on the image tiles and the populated form fields.
 *
 * Listener vs minister branching is driven by `isMinisterProfile(profile)` so
 * we keep one form, one validate, one save path.
 */
export function EditProfileDialog({
    profile,
    open,
    onOpenChange,
}: EditProfileDialogProps) {
    const initial = React.useMemo<ProfileFormValues>(
        () => mapProfileToFormValues(profile),
        [profile],
    );
    const [values, setValues] = React.useState<ProfileFormValues>(initial);
    const [submitting, setSubmitting] = React.useState(false);
    const update = useUpdateProfileMutation();

    React.useEffect(() => {
        setValues(initial);
    }, [initial]);

    const dirty = React.useMemo(() => {
        return JSON.stringify(initial) !== JSON.stringify(values);
    }, [initial, values]);

    /**
     * `ProfileFormValues` is a discriminated union, so the intersection of its
     * keys excludes minister-only fields. We accept the broader minister key
     * set here and cast on assignment - safe because the JSX gating below only
     * touches minister keys when `values.kind === 'minister'`.
     */
    type EditableField =
        | keyof ProfileFormValues
        | 'ministerialName'
        | 'ministryName'
        | 'ministryHQLocation'
        | 'ministryWebsite'
        | 'instagram'
        | 'twitter'
        | 'tiktok';

    const setField = (key: EditableField, value: unknown) => {
        setValues((prev) => {
            const next = { ...(prev as unknown as Record<string, unknown>) };
            next[key] = value;
            return next as unknown as ProfileFormValues;
        });
    };

    const handleClose = (next: boolean) => {
        if (!next && dirty && !submitting) {
            const ok = window.confirm(
                'You have unsaved changes. Discard them?',
            );
            if (!ok) return;
        }
        onOpenChange(next);
    };

    const onSave = async () => {
        const payload = mapFormValuesToUpdatePayload(initial, values);
        if (Object.keys(payload).length === 0) {
            onOpenChange(false);
            return;
        }
        setSubmitting(true);
        try {
            await update.mutateAsync(payload);
            toast.success('Profile updated');
            onOpenChange(false);
        } catch (err) {
            const message =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ??
                (err instanceof Error ? err.message : 'Could not save profile');
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const minister = isMinisterProfile(profile);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                showCloseButton={false}
                className={cn(
                    'max-h-[90vh] w-[477px] overflow-hidden border-[#545454]/50 bg-[#2b2a2c] p-0 sm:max-w-[477px]',
                )}
            >
                <div className="flex items-center justify-between border-b border-[#545454]/50 px-6 py-[18px]">
                    <DialogTitle className="font-matter-medium text-base leading-6 text-[#eaeaea]">
                        Edit Profile
                    </DialogTitle>
                    <button
                        type="button"
                        aria-label="Close edit profile"
                        onClick={() => handleClose(false)}
                        className="text-[#eaeaea] opacity-80 transition-opacity hover:opacity-100"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>

                <div className="max-h-[calc(90vh-61px-74px)] overflow-y-auto px-[18px] pb-6 pt-3">
                    <section className="flex flex-col gap-2.5">
                        <h3 className={sectionTitle}>Background image</h3>
                        <ImageUploadTile
                            variant="cover"
                            value={values.coverImage}
                            onChange={(v) => setField('coverImage', v)}
                            ariaLabel="cover image"
                        />
                    </section>

                    <section className="mt-8 flex flex-col gap-3">
                        <h3 className={sectionTitle}>Profile picture</h3>
                        <ImageUploadTile
                            variant="avatar"
                            value={values.avatar}
                            onChange={(v) => setField('avatar', v)}
                            ariaLabel="profile picture"
                        />
                    </section>

                    {minister && values.kind === 'minister' ? (
                        <section className="mt-8 flex flex-col gap-5">
                            <Field label="Minister's Name">
                                <Input
                                    className={inputBase}
                                    value={values.ministerialName}
                                    onChange={(e) =>
                                        setField(
                                            'ministerialName',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. Pastor Sam Adeyemi"
                                />
                            </Field>
                            <Field label="Ministry Name">
                                <Input
                                    className={inputBase}
                                    value={values.ministryName}
                                    onChange={(e) =>
                                        setField(
                                            'ministryName',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. Daystar Christian Centre"
                                />
                            </Field>
                            <Field label="About">
                                <textarea
                                    rows={5}
                                    className={cn(
                                        inputBase,
                                        'h-[120px] resize-none py-2',
                                    )}
                                    value={values.bio}
                                    onChange={(e) =>
                                        setField('bio', e.target.value)
                                    }
                                    placeholder="Tell listeners a bit about your ministry"
                                    maxLength={2000}
                                />
                            </Field>
                            <Field label="Location">
                                <Input
                                    className={inputBase}
                                    value={values.ministryHQLocation}
                                    onChange={(e) =>
                                        setField(
                                            'ministryHQLocation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. Plot A3C, Ikosi Road, Ikeja, Lagos"
                                />
                            </Field>

                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h3 className={sectionTitle}>
                                        Social networks
                                    </h3>
                                    <span className="inline-flex items-center gap-1 text-xs leading-[18px] text-[#bdbdbd]">
                                        <span className="text-base leading-none">
                                            &middot;
                                        </span>
                                        Optional
                                    </span>
                                </div>
                                <SocialInput
                                    icon="instagram"
                                    value={values.instagram}
                                    onChange={(v) =>
                                        setField('instagram', v)
                                    }
                                    placeholder="@instagram"
                                />
                                <SocialInput
                                    icon="twitter"
                                    value={values.twitter}
                                    onChange={(v) => setField('twitter', v)}
                                    placeholder="@twitter"
                                />
                                <SocialInput
                                    icon="tiktok"
                                    value={values.tiktok}
                                    onChange={(v) => setField('tiktok', v)}
                                    placeholder="@tiktok"
                                />
                            </div>
                        </section>
                    ) : (
                        <section className="mt-8">
                            <Field label="About">
                                <textarea
                                    rows={5}
                                    className={cn(
                                        inputBase,
                                        'h-[120px] resize-none py-2',
                                    )}
                                    value={values.bio}
                                    onChange={(e) =>
                                        setField('bio', e.target.value)
                                    }
                                    placeholder="Tell listeners a bit about yourself"
                                    maxLength={2000}
                                />
                            </Field>
                        </section>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-[#545454]/50 px-6 py-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-[42px] flex-1 border-[#bdbdbd]/30 bg-transparent text-sm font-medium text-[#eaeaea] hover:bg-white/5"
                        onClick={() => handleClose(false)}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onSave}
                        disabled={submitting || !dirty}
                        className="h-[42px] flex-1 bg-[#08ffdb] text-sm font-medium text-[#292929] hover:bg-[#08ffdb]/90"
                    >
                        {submitting ? 'Saving' : 'Save Changes'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="flex flex-col gap-2">
            <span className={fieldLabel}>{label}</span>
            {children}
        </label>
    );
}

const SocialIconMap: Record<
    'instagram' | 'twitter' | 'tiktok',
    React.ReactNode
> = {
    instagram: (
        <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="h-5 w-5 text-[#eaeaea]"
        >
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
            />
            <circle
                cx="12"
                cy="12"
                r="4"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
            />
            <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
        </svg>
    ),
    twitter: (
        <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="h-5 w-5 text-[#eaeaea]"
        >
            <path
                d="M18.244 3H21.5l-7.5 8.57L22.5 21h-6.836l-5.36-6.998L4 21H.74l8.018-9.165L0 3h7.012l4.846 6.402L18.244 3Zm-2.4 16.2h1.788L7.27 4.7H5.36l10.484 14.5Z"
                fill="currentColor"
            />
        </svg>
    ),
    tiktok: (
        <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="h-5 w-5 text-[#eaeaea]"
        >
            <path
                d="M16.5 3.2c.3 1.6 1.2 3 2.5 3.9 1 .7 2.2 1.1 3.5 1.2v3.4c-1.7-.05-3.3-.5-4.7-1.3v6.5c0 3.6-2.9 6.6-6.6 6.6S5 20.6 5 16.9c0-3.7 3-6.6 6.6-6.6.3 0 .6 0 .9.05v3.5c-.3-.1-.6-.15-.9-.15a3.2 3.2 0 1 0 3.2 3.2V3.2h1.7Z"
                fill="currentColor"
            />
        </svg>
    ),
};

function SocialInput({
    icon,
    value,
    onChange,
    placeholder,
}: {
    icon: keyof typeof SocialIconMap;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <label className="flex h-10 items-center gap-2 rounded-md border border-[#545454]/50 px-2">
            <span aria-hidden>{SocialIconMap[icon]}</span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-full flex-1 bg-transparent text-sm text-[#eaeaea] placeholder:text-[#9d9d9d] focus:outline-none"
            />
        </label>
    );
}

export default EditProfileDialog;

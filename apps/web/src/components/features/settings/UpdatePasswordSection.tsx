import { useState } from 'react';
import { Eye, EyeOff, Loader2, LockIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ChangePasswordDTO } from '@/dtos/auth.dto';
import useAuth from '@/hooks/app/useAuth';
import { usePasswordUtils } from '@/hooks/shared/useValidaton';
import { isApiHttp2xxErrorEnvelope } from '@/api/core/api-envelope-toast';
import { PATH_LOGIN } from '@/routes/paths';
import { clearLocalAuth } from '@/utils/auth-session.util';
import { cn } from '@/lib/utils';

import { SettingsSectionCard } from './SettingsSectionCard';

export function UpdatePasswordSection() {
    const navigate = useNavigate();
    const { changePassword } = useAuth();
    const { validatePassword } = usePasswordUtils();

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({
            currentPassword: true,
            newPassword: true,
            confirmPassword: true,
        });

        const newErrors: Record<string, string> = {};
        if (!formData.currentPassword.trim()) {
            newErrors.currentPassword = 'Current password is required';
        }
        const passwordError = validatePassword(formData.newPassword);
        if (passwordError) {
            newErrors.newPassword = passwordError;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        if (
            formData.currentPassword &&
            formData.newPassword &&
            formData.currentPassword === formData.newPassword
        ) {
            newErrors.newPassword =
                'New password must be different from your current password';
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        const payload: ChangePasswordDTO = {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
        };

        setSubmitting(true);
        try {
            const res = await changePassword(payload);
            if (res.error) {
                if (!isApiHttp2xxErrorEnvelope(res)) {
                    toast.error(res.message || 'Could not change password.');
                }
                return;
            }
            toast.success(
                res.message ||
                    'Password updated. Sign in again with your new password.',
            );
            clearLocalAuth();
            navigate(PATH_LOGIN, { replace: true });
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : 'Could not change password.',
            );
        } finally {
            setSubmitting(false);
        }
    };

    const renderPasswordField = (
        id: string,
        label: string,
        field: keyof typeof formData,
        show: boolean,
        setShow: (v: boolean) => void,
    ) => (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={formData[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    onBlur={() =>
                        setTouched((prev) => ({ ...prev, [field]: true }))
                    }
                    className={cn(
                        'h-11 border-[#545454] bg-transparent pl-9 pr-10 text-[#eaeaea]',
                        errors[field] &&
                            touched[field] &&
                            'border-destructive focus-visible:ring-destructive',
                    )}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShow(!show)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                >
                    {show ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                </Button>
            </div>
            {errors[field] && touched[field] ? (
                <p className="text-sm text-destructive" role="alert">
                    {errors[field]}
                </p>
            ) : null}
        </div>
    );

    return (
        <SettingsSectionCard
            title="Update password"
            description="Ensure your account is using a long, random password to stay secure."
        >
            <form
                className="flex max-w-md flex-col gap-4"
                onSubmit={(e) => void handleSubmit(e)}
            >
                {renderPasswordField(
                    'settings-current-password',
                    'Current password',
                    'currentPassword',
                    showCurrent,
                    setShowCurrent,
                )}
                {renderPasswordField(
                    'settings-new-password',
                    'New password',
                    'newPassword',
                    showNew,
                    setShowNew,
                )}
                {renderPasswordField(
                    'settings-confirm-password',
                    'Password confirmation',
                    'confirmPassword',
                    showConfirm,
                    setShowConfirm,
                )}
                <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 w-fit min-w-[120px] bg-[#eaeaea] text-[#1c1c1e] hover:bg-white"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save'
                    )}
                </Button>
            </form>
        </SettingsSectionCard>
    );
}

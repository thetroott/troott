import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, LockIcon } from 'lucide-react';
import type { ChangePasswordDTO } from '@/dtos/auth.dto';
import { usePasswordUtils } from '@/hooks/shared/useValidaton';
import useAuth from '@/hooks/app/useAuth';
import { isApiHttp2xxErrorEnvelope } from '@/api/core/api-envelope-toast';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ChangePasswordForm = () => {
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

    const { validatePassword } = usePasswordUtils();
    const { changePassword } = useAuth();

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
        if (passwordError) newErrors.newPassword = passwordError;
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
        if (Object.keys(newErrors).length > 0) return;

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
            toast.success(res.message || 'Password updated.');
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setTouched({});
            setErrors({});
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : 'Could not change password.',
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
                        'pl-9 pr-10 h-12',
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
            {errors[field] && touched[field] && (
                <p className="text-sm text-destructive" role="alert">
                    {errors[field]}
                </p>
            )}
        </div>
    );

    return (
        <form className="flex flex-col gap-6 max-w-md" onSubmit={handleSubmit}>
            {renderPasswordField(
                'current-password',
                'Current password',
                'currentPassword',
                showCurrent,
                setShowCurrent,
            )}
            {renderPasswordField(
                'new-password',
                'New password',
                'newPassword',
                showNew,
                setShowNew,
            )}
            {renderPasswordField(
                'confirm-password',
                'Confirm new password',
                'confirmPassword',
                showConfirm,
                setShowConfirm,
            )}
            <Button type="submit" className="w-full h-12" disabled={submitting}>
                {submitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                    </>
                ) : (
                    'Update password'
                )}
            </Button>
        </form>
    );
};

export default ChangePasswordForm;

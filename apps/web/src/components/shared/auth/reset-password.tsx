import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { usePasswordUtils } from '@/hooks/shared/useValidaton';
import useAuth from '@/hooks/useAuth';
import storage from '@/utils/storage.util';

const ResetPasswordForm = () => {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { validatePassword, calculateStrength } = usePasswordUtils();
    const { ResetPassword } = useAuth();

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleBlur = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));

        let error = '';

        if (field === 'newPassword') {
            error = validatePassword(formData.newPassword) || '';
        } else if (field === 'confirmPassword') {
            if (formData.newPassword !== formData.confirmPassword) {
                error = 'Passwords do not match';
            }
        }

        if (error) {
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({
            newPassword: true,
            confirmPassword: true,
        });

        // Validate form
        const newErrors: Record<string, string> = {};
        const passwordError = validatePassword(formData.newPassword);
        const confirmError =
            formData.newPassword !== formData.confirmPassword
                ? 'Passwords do not match'
                : '';

        if (passwordError) newErrors.newPassword = passwordError;
        if (confirmError) newErrors.confirmPassword = confirmError;

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                await ResetPassword.mutateAsync({
                    email: storage.getUserEmail() || '',
                    newPassword: formData.newPassword,
                });
            } catch (error) {
                console.error('Reset password error:', error);
            }
        }
    };

    const passwordStrength = calculateStrength(formData.newPassword);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                    <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) =>
                            handleChange('newPassword', e.target.value)
                        }
                        onBlur={() => handleBlur('newPassword')}
                        className={errors.newPassword ? 'border-red-500' : ''}
                        placeholder="Enter your new password"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                {errors.newPassword && touched.newPassword && (
                    <p className="text-sm text-red-500">{errors.newPassword}</p>
                )}

                {/* Password Strength Indicator */}
                {formData.newPassword && (
                    <div className="space-y-1">
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                    key={level}
                                    className={`h-1 w-full rounded ${
                                        level <= passwordStrength.score
                                            ? passwordStrength.score <= 2
                                                ? 'bg-red-500'
                                                : passwordStrength.score <= 3
                                                  ? 'bg-yellow-500'
                                                  : 'bg-green-500'
                                            : 'bg-gray-200'
                                    }`}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-gray-600">
                            Password strength: {passwordStrength.label}
                        </p>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                            handleChange('confirmPassword', e.target.value)
                        }
                        onBlur={() => handleBlur('confirmPassword')}
                        className={
                            errors.confirmPassword ? 'border-red-500' : ''
                        }
                        placeholder="Confirm your new password"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                        }
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                    <p className="text-sm text-red-500">
                        {errors.confirmPassword}
                    </p>
                )}
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={
                    ResetPassword.isPending || Object.keys(errors).length > 0
                }
            >
                {ResetPassword.isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                    </>
                ) : (
                    'Reset Password'
                )}
            </Button>
        </form>
    );
};

export default ResetPasswordForm;

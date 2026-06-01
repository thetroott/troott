import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { IForm } from '@/utils/interfaces.util';
import { Eye, EyeOff, Loader2, LockIcon, Mail } from 'lucide-react';
import useAuth from '@/hooks/app/useAuth';
import { usePasswordUtils } from '@/hooks/shared/useValidaton';
import { useMemo, useState } from 'react';
import type { LoginDTO } from '@/dtos/auth.dto';
import { isApiHttp2xxErrorEnvelope } from '@/api/core/api-envelope-toast';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { PATH_FORGOT_PASSWORD, PATH_REGISTER } from '@/routes/paths';
import storage from '@/api/services/local-storage';

const LoginForm = (data: IForm) => {
    const { className, ...props } = data;

    const [formData, setFormData] = useState<LoginDTO>({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>(
        {},
    );
    const [touched, setTouched] = useState<{
        email?: boolean;
        password?: boolean;
    }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { validateEmail, validatePassword, calculateStrength } =
        usePasswordUtils();
    const { login } = useAuth();

    const passwordStrength = useMemo(
        () => calculateStrength(formData.password),
        [formData.password, calculateStrength],
    );

    const setField = (field: keyof LoginDTO, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setTouched({ email: true, password: true });

        const newErrors: { email?: string; password?: string } = {};
        const emailErr = validateEmail(formData.email);
        const passErr = validatePassword(formData.password);

        if (emailErr) newErrors.email = emailErr;
        if (passErr) newErrors.password = passErr;

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        setSubmitting(true);
        try {
            const res = await login(formData);
            if (res.error) {
                if (!isApiHttp2xxErrorEnvelope(res)) {
                    toast.error(res.message || 'Sign in failed.');
                }
                return;
            }
            if (res.status === 206) {
                toast.info(
                    res.message ||
                        'Activate your account with the code we sent to your email.',
                );
                return;
            }
            if (res.status === 200) {
                if (!storage.checkToken() || !storage.checkUserID()) {
                    toast.error(
                        'Sign-in succeeded but your session could not be saved. Please try again.',
                    );
                    return;
                }
                toast.success(res.message || 'Signed in successfully.');
            }
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : 'Sign in failed.',
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <form
                className={cn('flex flex-col gap-6', className)}
                onSubmit={handleSubmit}
                {...props}
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={formData.email}
                                onChange={(e) =>
                                    setField('email', e.target.value)
                                }
                                onBlur={() => {
                                    setTouched((t) => ({ ...t, email: true }));
                                    const err = validateEmail(formData.email);
                                    if (err)
                                        setErrors((prev) => ({
                                            ...prev,
                                            email: err,
                                        }));
                                }}
                                className={cn(
                                    'pl-9',
                                    'pr-10',
                                    'h-12',
                                    'focus-visible:ring-2',
                                    'focus-visible:ring-teal-400',
                                    'focus-visible:outline-none',
                                    errors.email &&
                                        touched.email &&
                                        'border-destructive focus-visible:ring-destructive',
                                )}
                                aria-invalid={
                                    errors.email && touched.email
                                        ? 'true'
                                        : 'false'
                                }
                                aria-describedby={
                                    errors.email && touched.email
                                        ? 'email-error'
                                        : undefined
                                }
                            />
                        </div>
                        {errors.email && touched.email && (
                            <p
                                id="email-error"
                                className="text-sm text-destructive"
                                role="alert"
                            >
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                to={PATH_FORGOT_PASSWORD}
                                className="ml-auto text-sm underline-offset-4 hover:underline"
                            >
                                Forgot your password?
                            </Link>
                        </div>

                        <div className="relative">
                            <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => {
                                    setField('password', e.target.value);
                                }}
                                onBlur={() => {
                                    setTouched((t) => ({
                                        ...t,
                                        password: true,
                                    }));
                                    const err = validatePassword(
                                        formData.password,
                                    );
                                    if (err)
                                        setErrors((prev) => ({
                                            ...prev,
                                            password: err,
                                        }));
                                }}
                                className={cn(
                                    'pl-9',
                                    'pr-10',
                                    'h-12',
                                    errors.password &&
                                        touched.password &&
                                        'border-destructive focus-visible:ring-destructive',
                                )}
                                aria-invalid={
                                    errors.password && touched.password
                                        ? 'true'
                                        : 'false'
                                }
                                aria-describedby={
                                    errors.password && touched.password
                                        ? 'password-error'
                                        : undefined
                                }
                            />

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword((s) => !s)}
                                aria-label={
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>

                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-muted  rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                'h-full transition-all duration-300 rounded-full',
                                                passwordStrength.score === 0 &&
                                                    'w-0',
                                                passwordStrength.score === 1 &&
                                                    'w-1/5 bg-red-500',
                                                passwordStrength.score === 2 &&
                                                    'w-2/5 bg-orange-500',
                                                passwordStrength.score === 3 &&
                                                    'w-3/5 bg-yellow-500',
                                                passwordStrength.score === 4 &&
                                                    'w-4/5 bg-blue-500',
                                                passwordStrength.score === 5 &&
                                                    'w-full bg-green-500',
                                            )}
                                        />
                                    </div>
                                    <span
                                        className={cn(
                                            'text-xs font-medium',
                                            passwordStrength.score <= 1 &&
                                                'text-red-500',
                                            passwordStrength.score === 2 &&
                                                'text-orange-500',
                                            passwordStrength.score === 3 &&
                                                'text-yellow-600',
                                            passwordStrength.score === 4 &&
                                                'text-blue-500',
                                            passwordStrength.score === 5 &&
                                                'text-green-500',
                                        )}
                                    >
                                        {passwordStrength.label}
                                    </span>
                                </div>

                                {passwordStrength.feedback.length > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                        <p className="mb-1">Password needs:</p>
                                        <ul className="list-disc list-inside space-y-0.5">
                                            {passwordStrength.feedback.map(
                                                (item, index) => (
                                                    <li key={index}>{item}</li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {errors.password && touched.password && (
                            <p
                                id="password-error"
                                className="text-sm text-destructive"
                                role="alert"
                            >
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                Signing in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </Button>

                    {/* <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
          <Button variant="outline" className="w-full" type="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="mr-2 h-4 w-4"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Login with Google
          </Button>
          <Button variant="outline" className="w-full" type="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="mr-2 h-4 w-4"
            >
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Login with GitHub
          </Button> */}
                </div>
                <div className="text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link
                        to={PATH_REGISTER}
                        className="underline underline-offset-4"
                    >
                        Sign up
                    </Link>
                </div>
            </form>
        </>
    );
};

export default LoginForm;

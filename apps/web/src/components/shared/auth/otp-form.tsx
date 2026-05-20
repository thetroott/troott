import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { IForm, IOtpFormErrors } from '@/utils/interfaces.util';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { isApiHttp2xxErrorEnvelope } from '@/api/core/api-envelope-toast';
import { toast } from 'sonner';
import type { VerifyOtpDTO } from '@/dtos/auth.dto';
import useAuth from '@/hooks/app/useAuth';
import storage from '@/api/services/local-storage';
import { OtpType } from '@/api/enums';
import { cleanStoredEmail } from '@/components/shared/auth/auth-form.utils';
import { AUTH_ROUTES } from '@/constants/auth-routes';
import { Link } from 'react-router-dom';

const OtpForm = (data: IForm) => {
    const { className, email, onSuccess, onResend, ...props } = data;

    const navigate = useNavigate();

    const { verifyOtp, resendOtp } = useAuth();

    const [otp, setOtp] = useState(Array(6).fill(''));
    const [errors, setErrors] = useState<IOtpFormErrors>({});
    const [touched, setTouched] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [pending, setPending] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const resolvedEmail =
        cleanStoredEmail(email) ||
        cleanStoredEmail(storage.getUserEmail() ?? '');

    const validateOTP = (digits: string[]): string | undefined => {
        const otpString = digits.join('');
        if (!otpString) return 'OTP is required';
        if (otpString.length !== 6) return 'Please enter all 6 digits';
        if (!/^\d+$/.test(otpString)) return 'OTP must contain only numbers';
    };

    const submitVerification = async (payload: VerifyOtpDTO) => {
        if (!payload.email) {
            toast.error('Missing email. Register again or sign in.');
            return;
        }
        setPending(true);
        try {
            const res = await verifyOtp(payload);
            if (res.error) {
                if (!isApiHttp2xxErrorEnvelope(res)) {
                    toast.error(res.message || 'Verification failed.');
                }
                return;
            }
            toast.success(res.message || 'OTP verified.');
            navigate(AUTH_ROUTES.login);
            onSuccess?.();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : 'Verification failed.',
            );
        } finally {
            setPending(false);
        }
    };

    const maskEmail = (email: string): string => {
        if (!email) return '';
        const [localPart = '', domain = ''] = email.split('@');
        if (!domain || localPart.length <= 2) return email;
        const maskedLocal =
            localPart[0] +
            '*'.repeat(localPart.length - 2) +
            localPart[localPart.length - 1];
        return `${maskedLocal}@${domain}`;
    };

    const startResendCountdown = () => {
        setResendCountdown(60);
        const timer = setInterval(() => {
            setResendCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const buildOtpPayload = (): VerifyOtpDTO => ({
        email: resolvedEmail,
        otp: Number(otp.join('')),
        otpType: OtpType.REGISTER,
    });

    const handleOTPChange = (index: number, value: string) => {
        // Remove non-digit characters immediately
        const numericValue = value.replace(/\D/g, '');
        if (!numericValue) {
            // Clear this field if nothing valid
            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        const otpError = validateOTP(newOtp);
        if (otpError) {
            setErrors({ otp: otpError });
        } else {
            setErrors({});
        }

        setTouched(true);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOTPKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOTPPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();

        const pasted = e.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, 6);

        if (!pasted) return;

        const newOtp = pasted.split('');
        setOtp(newOtp);

        // Focus last input
        otpRefs.current[newOtp.length - 1]?.focus();

        // Auto-submit if all 6 digits present
        if (newOtp.length === 6) {
            setTouched(true);

            const otpError = validateOTP(newOtp);
            if (!otpError) {
                setErrors({});
                void submitVerification({
                    email: resolvedEmail,
                    otp: Number(newOtp.join('')),
                    otpType: OtpType.REGISTER,
                });
            } else {
                setErrors({ otp: otpError });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setTouched(true);

        const otpError = validateOTP(otp);
        if (otpError) {
            setErrors({ otp: otpError });
            return;
        }

        setErrors({});

        await submitVerification(buildOtpPayload());
    };

    const handleResendOTP = async () => {
        if (!resolvedEmail) {
            toast.error('Missing email. Register again or sign in.');
            return;
        }
        setPending(true);
        try {
            const res = await resendOtp({
                email: resolvedEmail,
                otpType: OtpType.REGISTER,
            });
            if (res.error) {
                if (!isApiHttp2xxErrorEnvelope(res)) {
                    toast.error(res.message || 'Could not resend code.');
                }
                return;
            }
            toast.success(res.message || 'A new code was sent.');
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : 'Could not resend code.',
            );
        } finally {
            setPending(false);
        }
        setOtp(Array(6).fill(''));
        setErrors({});
        setTouched(false);
        startResendCountdown();
        otpRefs.current[0]?.focus();
        onResend?.();
    };

    return (
        <form
            className={cn('flex flex-col gap-6', className)}
            onSubmit={handleSubmit}
            {...props}
        >
            <div className="grid gap-6">
                {resolvedEmail && (
                    <div className="text-center text-sm text-muted-foreground">
                        <p>We sent a verification code to</p>
                        <p className="font-medium text-foreground">
                            {maskEmail(resolvedEmail)}
                        </p>
                    </div>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="otp-0">Verification Code</Label>
                    <div className="flex gap-2 justify-center">
                        {otp.map((digit, index) => (
                            <Input
                                key={index}
                                id={`otp-${index}`}
                                ref={(el) => {
                                    otpRefs.current[index] = el;
                                    return undefined;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) =>
                                    handleOTPChange(index, e.target.value)
                                }
                                onKeyDown={(e) => handleOTPKeyDown(index, e)}
                                onPaste={
                                    index === 0 ? handleOTPPaste : undefined
                                }
                                className={cn(
                                    'w-12 h-12 text-center text-lg font-semibold',
                                    errors.otp &&
                                        touched &&
                                        'border-destructive focus-visible:ring-destructive',
                                )}
                                aria-invalid={
                                    errors.otp && touched ? 'true' : 'false'
                                }
                                aria-describedby={
                                    errors.otp && touched
                                        ? 'otp-error'
                                        : undefined
                                }
                            />
                        ))}
                    </div>
                    {errors.otp && touched && (
                        <p
                            id="otp-error"
                            className="text-sm text-destructive text-center"
                            role="alert"
                        >
                            {errors.otp}
                        </p>
                    )}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    <p>
                        Didn't receive the code?{' '}
                        {resendCountdown > 0 ? (
                            <span>Resend in {resendCountdown}s</span>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={pending}
                                className="text-primary underline underline-offset-4 hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Resend code
                            </button>
                        )}
                    </p>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Activating a new account?{' '}
                    <Link
                        to={AUTH_ROUTES.activateAccount}
                        className="text-primary underline underline-offset-4 hover:no-underline"
                    >
                        Continue on activate account
                    </Link>
                </p>

                <Button
                    type="submit"
                    className="w-full h-12 "
                    disabled={pending}
                >
                    {pending ? (
                        <>
                            <Loader2 className="animate-spin h-4 w-4" />
                            Verifying...
                        </>
                    ) : (
                        'Verify code'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default OtpForm;

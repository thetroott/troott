import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { IForm, IOtpFormErrors } from '@/utils/interfaces.util';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { OtpType } from '@/utils/enums.util';
import type { VerifyOtpDTO } from '@/dtos/auth.dto';
import storage from '@/utils/storage.util';
import useAuth from '@/hooks/useAuth';

const ActivateUserForm = (data: IForm) => {
    const { className, email, onSuccess, onResend, ...props } = data;

    const { ActivateUser } = useAuth();

    const [otp, setOtp] = useState(Array(6).fill(''));
    const [errors, setErrors] = useState<IOtpFormErrors>({});
    const [touched, setTouched] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const validateOTP = (otp: string[]): string | undefined => {
        const otpString = otp.join('');
        if (!otpString) return 'OTP is required';
        if (otpString.length !== 6) return 'Please enter all 6 digits';
        if (!/^\d+$/.test(otpString)) return 'OTP must contain only numbers';
    };

    const maskEmail = (email: string): string => {
        if (!email) return '';
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 2) return email;
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

    const userEmail = storage.getUserEmail() as string;
    const buildOtpPayload = (): VerifyOtpDTO => {
        const otpString = otp.join('');
        // Clean email by removing extra quotes if present and parsing JSON if needed
        let cleanEmail = userEmail || '';

        // If the email is JSON stringified, parse it
        if (cleanEmail.startsWith('"') && cleanEmail.endsWith('"')) {
            try {
                cleanEmail = JSON.parse(cleanEmail);
            } catch (e) {
                // If parsing fails, just remove the quotes
                cleanEmail = cleanEmail.replace(/^"(.*)"$/, '$1');
            }
        }

        return {
            email: cleanEmail,
            otp: Number(otpString),
            otpType: OtpType.REGISTER,
        };
    };

    const handleOTPChange = (index: number, value: string) => {
        // Remove non-digit characters immediately
        const numericValue = value.replace(/\D/g, '');

        const newOtp = [...otp];

        if (!numericValue) {
            // Clear this field if nothing valid
            newOtp[index] = '';
            setOtp(newOtp);
            return;
        }

        // Handle multiple digits pasted in one field
        if (numericValue.length > 1) {
            // Fill current and subsequent fields with the digits
            for (let i = 0; i < numericValue.length && index + i < 6; i++) {
                newOtp[index + i] = numericValue[i];
            }
            setOtp(newOtp);

            // Focus the last filled field or next empty field
            const nextIndex = Math.min(index + numericValue.length - 1, 5);
            setTimeout(() => {
                otpRefs.current[nextIndex]?.focus();
            }, 0);
        } else {
            // Single digit input
            newOtp[index] = numericValue;
            setOtp(newOtp);

            // Auto-focus next input
            if (numericValue && index < 5) {
                setTimeout(() => {
                    otpRefs.current[index + 1]?.focus();
                }, 0);
            }
        }

        const otpError = validateOTP(newOtp);
        if (otpError) {
            setErrors({ otp: otpError });
        } else {
            setErrors({});
        }

        setTouched(true);
    };

    const handleOTPKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        const { key, ctrlKey, metaKey } = e;

        // Handle backspace
        if (key === 'Backspace') {
            e.preventDefault();
            const newOtp = [...otp];

            if (otp[index]) {
                // If there's a value in current field, clear it
                newOtp[index] = '';
                setOtp(newOtp);
            } else if (index > 0) {
                // If current field is empty, move to previous field and clear it
                newOtp[index - 1] = '';
                setOtp(newOtp);
                otpRefs.current[index - 1]?.focus();
            }
            return;
        }

        // Handle delete key
        if (key === 'Delete') {
            e.preventDefault();
            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);
            return;
        }

        // Handle arrow keys for navigation
        if (key === 'ArrowLeft' && index > 0) {
            e.preventDefault();
            otpRefs.current[index - 1]?.focus();
            return;
        }

        if (key === 'ArrowRight' && index < 5) {
            e.preventDefault();
            otpRefs.current[index + 1]?.focus();
            return;
        }

        // Handle home and end keys
        if (key === 'Home') {
            e.preventDefault();
            otpRefs.current[0]?.focus();
            return;
        }

        if (key === 'End') {
            e.preventDefault();
            otpRefs.current[5]?.focus();
            return;
        }

        // Handle Ctrl+A (select all)
        if ((ctrlKey || metaKey) && key === 'a') {
            e.preventDefault();
            // Select all OTP inputs
            otpRefs.current.forEach((ref) => {
                if (ref) {
                    ref.select();
                }
            });
            return;
        }

        // Handle Ctrl+V (paste) - let the paste handler take care of it
        if ((ctrlKey || metaKey) && key === 'v') {
            return; // Let the paste handler work
        }

        // Handle Ctrl+C (copy) - copy current OTP
        if ((ctrlKey || metaKey) && key === 'c') {
            e.preventDefault();
            const otpString = otp.join('');
            if (otpString) {
                navigator.clipboard.writeText(otpString);
            }
            return;
        }

        // Handle Ctrl+X (cut) - copy and clear OTP
        if ((ctrlKey || metaKey) && key === 'x') {
            e.preventDefault();
            const otpString = otp.join('');
            if (otpString) {
                navigator.clipboard.writeText(otpString);
                setOtp(Array(6).fill(''));
                otpRefs.current[0]?.focus();
            }
            return;
        }

        // Handle Tab navigation
        if (key === 'Tab') {
            if (!e.shiftKey && index < 5) {
                e.preventDefault();
                otpRefs.current[index + 1]?.focus();
            } else if (e.shiftKey && index > 0) {
                e.preventDefault();
                otpRefs.current[index - 1]?.focus();
            }
            return;
        }

        // Handle Enter key - submit if OTP is complete
        if (key === 'Enter') {
            e.preventDefault();
            const otpString = otp.join('');
            if (otpString.length === 6) {
                const otpError = validateOTP(otp);
                if (!otpError) {
                    setErrors({});
                    try {
                        ActivateUser.mutateAsync(buildOtpPayload());
                    } catch (error) {
                        console.error('Submit error:', error);
                    }
                } else {
                    setErrors({ otp: otpError });
                }
            }
            return;
        }

        // Allow only digits, ignore other keys
        if (
            !/^\d$/.test(key) &&
            ![
                'Backspace',
                'Delete',
                'ArrowLeft',
                'ArrowRight',
                'Home',
                'End',
                'Tab',
                'Enter',
            ].includes(key)
        ) {
            e.preventDefault();
        }
    };

    const handleOTPPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();

        const pastedText = e.clipboardData.getData('text');

        // Extract only digits from pasted text
        const pasted = pastedText.replace(/\D/g, '').slice(0, 6);

        if (!pasted) return;

        // Create array with exactly 6 elements, filling with pasted digits and empty strings
        const newOtp = Array(6).fill('');
        for (let i = 0; i < pasted.length && i < 6; i++) {
            newOtp[i] = pasted[i];
        }

        setOtp(newOtp);
        setTouched(true);

        // Focus the last filled field or next empty field
        const focusIndex = Math.min(pasted.length - 1, 5);
        setTimeout(() => {
            otpRefs.current[focusIndex]?.focus();
        }, 0);

        // Auto-submit if all 6 digits present
        if (pasted.length === 6) {
            const otpError = validateOTP(newOtp);
            if (!otpError) {
                setErrors({});
                // Create payload with the new OTP array directly instead of using buildOtpPayload()
                const userEmail = storage.getUserEmail() as string;
                let cleanEmail = userEmail || '';

                // If the email is JSON stringified, parse it
                if (cleanEmail.startsWith('"') && cleanEmail.endsWith('"')) {
                    try {
                        cleanEmail = JSON.parse(cleanEmail);
                    } catch (e) {
                        // If parsing fails, just remove the quotes
                        cleanEmail = cleanEmail.replace(/^"(.*)"$/, '$1');
                    }
                }

                const payload = {
                    email: cleanEmail,
                    otp: Number(newOtp.join('')),
                    otpType: OtpType.REGISTER,
                };

                // Handle auto-submit with proper error handling
                try {
                    ActivateUser.mutateAsync(payload);
                } catch (error) {
                    console.error('Auto-submit error:', error);
                }
            } else {
                setErrors({ otp: otpError });
            }
        } else {
            // Clear any existing errors if not complete
            setErrors({});
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

        try {
            await ActivateUser.mutateAsync(buildOtpPayload());
        } catch (error) {
            console.error('Activation error:', error);
            // The error will be handled by the mutation's onError callback
        }
    };

    const handleResendOTP = async () => {
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
                {email && (
                    <div className="text-center text-sm text-muted-foreground">
                        <p>We sent a verification code to</p>
                        <p className="font-medium text-foreground">
                            {maskEmail(email)}
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
                                onFocus={(e) => e.target.select()}
                                onInput={(e) => {
                                    // Handle direct input (like from mobile keyboards)
                                    const target = e.target as HTMLInputElement;
                                    const value = target.value;
                                    if (value.length > 1) {
                                        handleOTPChange(index, value);
                                    }
                                }}
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
                                disabled={ActivateUser.isPending}
                                className="text-primary underline underline-offset-4 hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Resend code
                            </button>
                        )}
                    </p>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 "
                    disabled={ActivateUser.isPending}
                >
                    {ActivateUser.isPending ? (
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

export default ActivateUserForm;

import { Pressable, StyleSheet, View } from 'react-native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import OTPFormInput from '@/components/ui/otp-forminput';
import Button from '@/components/ui/button';
import TermsAndConditions from '@/components/features/auth/TermsConditions';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import { OTPSchema, OTPType } from '@/validation/otp';
import { useForgotPasswordAuth } from '@/context';
import { useAuth } from '@/api/hooks/app/useAuth';
import { OtpType } from '@/models/User.model';

const ForgotPasswordOtpForm = () => {
    const { formData, resendCountdown } = useForgotPasswordAuth();
    const { VerifyOtpMutation, ResendOtpMutation } = useAuth();

    const form = useForm<OTPType>({
        defaultValues: {
            otp: '',
        },
        resolver: zodResolver(OTPSchema),
    });

    const handleFormSubmit = (data: OTPType) => {
        if (!formData.email) {
            return;
        }
        VerifyOtpMutation.mutate({
            email: formData.email,
            otp: Number(data.otp),
            otpType: OtpType.FORGOTPASSWORD,
        });
    };

    const handleResend = () => {
        if (resendCountdown > 0 || !formData.email) {
            return;
        }
        ResendOtpMutation.mutate({
            email: formData.email,
            otpType: OtpType.FORGOTPASSWORD,
        });
    };

    return (
        <View style={styles.container}>
            <OTPFormInput name="otp" control={form.control} />
            <TermsAndConditions />
            <Button
                label="Continue"
                disabled={
                    !form.formState.isValid ||
                    !formData.email ||
                    VerifyOtpMutation.isPending
                }
                isLoading={VerifyOtpMutation.isPending}
                onPress={form.handleSubmit(handleFormSubmit)}
            />
            <Text color={theme.colors.grey[500]}>
                This code will expire in 5 minutes.
            </Text>
            <Pressable
                onPress={handleResend}
                disabled={resendCountdown > 0 || ResendOtpMutation.isPending}
            >
                <Text
                    weight="semiBold"
                    color={
                        resendCountdown > 0
                            ? theme.colors.grey[500]
                            : theme.colors.teal[500]
                    }
                    size="base"
                >
                    {resendCountdown > 0
                        ? `Resend code in ${resendCountdown}s`
                        : 'Resend Code'}
                </Text>
            </Pressable>
        </View>
    );
};

export default ForgotPasswordOtpForm;

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
});

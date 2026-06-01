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
import { useRegisterAuth } from '@/context';
import { useAuth } from '@/api/hooks/app/useAuth';
import { OtpType } from '@/models/User.model';

const VerifyEmailForm = () => {
    const { email } = useRegisterAuth();
    const { ActivateMutation, ResendOtpMutation } = useAuth();

    const form = useForm<OTPType>({
        defaultValues: {
            otp: '',
        },
        resolver: zodResolver(OTPSchema),
    });

    const handleFormSubmit = (data: OTPType) => {
        if (!email) {
            return;
        }
        ActivateMutation.mutate({
            email,
            otp: Number(data.otp),
            otpType: OtpType.REGISTER,
        });
    };

    const handleResend = () => {
        if (!email || ResendOtpMutation.isPending) {
            return;
        }
        ResendOtpMutation.mutate({
            email,
            otpType: OtpType.REGISTER,
        });
    };

    return (
        <View style={styles.container}>
            <OTPFormInput name="otp" control={form.control} />
            <TermsAndConditions />
            <Button
                label="Continue"
                disabled={!form.formState.isValid || !email}
                isLoading={ActivateMutation.isPending}
                onPress={form.handleSubmit(handleFormSubmit)}
            />
            <Text color={theme.colors.grey[200]}>
                This code will expire in 5 minutes.{' '}
            </Text>
            <Pressable onPress={handleResend} disabled={ResendOtpMutation.isPending}>
                <Text weight="semiBold" color={theme.colors.teal[500]} size="base">
                    Resend Code
                </Text>
            </Pressable>
        </View>
    );
};

export default VerifyEmailForm;

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
});

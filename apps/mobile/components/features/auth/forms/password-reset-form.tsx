import { StyleSheet, View } from 'react-native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/components/ui/button';
import TermsAndConditions from '@/components/features/auth/TermsConditions';
import { theme } from '@/constants/theme';
import FormInput from '@/components/ui/forminput';
import { Lock } from 'iconsax-react-nativejs';
import { useForgotPasswordAuth } from '@/context';
import { useAuth } from '@/api/hooks/app/useAuth';
import {
    ResetPasswordSchema,
    ResetPasswordType,
} from '@/validation/reset-password';

const PasswordResetForm = () => {
    const { formData } = useForgotPasswordAuth();
    const { ResetPasswordMutation } = useAuth();

    const form = useForm<ResetPasswordType>({
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
        resolver: zodResolver(ResetPasswordSchema),
    });

    const handleFormSubmit = (data: ResetPasswordType) => {
        if (!formData.email) {
            return;
        }
        ResetPasswordMutation.mutate({
            email: formData.email,
            newPassword: data.newPassword,
        });
    };

    return (
        <View style={styles.container}>
            <FormInput
                name="newPassword"
                control={form.control}
                label="New password"
                placeholder="*********"
                leftIcon={<Lock color={theme.colors.grey[400]} size={20} />}
            />
            <FormInput
                name="confirmPassword"
                control={form.control}
                label="Confirm password"
                placeholder="*********"
                leftIcon={<Lock color={theme.colors.grey[400]} size={20} />}
            />
            <TermsAndConditions />
            <Button
                label="Reset password"
                disabled={
                    !form.formState.isValid ||
                    !formData.email ||
                    ResetPasswordMutation.isPending
                }
                isLoading={ResetPasswordMutation.isPending}
                onPress={form.handleSubmit(handleFormSubmit)}
            />
        </View>
    );
};

export default PasswordResetForm;

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
});

import { StyleSheet, View } from 'react-native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/components/ui/button';
import FormInput from '@/components/ui/forminput';
import { Lock } from 'iconsax-react-nativejs';
import { theme } from '@/constants/theme';
import { useAuth } from '@/api/hooks/app/useAuth';
import { z } from 'zod';

const ChangePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters long'),
        confirmPassword: z.string().min(1, 'Please confirm your new password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type ChangePasswordFormType = z.infer<typeof ChangePasswordSchema>;

const ChangePasswordForm = () => {
    const { ChangePasswordMutation } = useAuth();

    const form = useForm<ChangePasswordFormType>({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        resolver: zodResolver(ChangePasswordSchema),
    });

    const handleFormSubmit = (data: ChangePasswordFormType) => {
        ChangePasswordMutation.mutate({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        });
    };

    return (
        <View style={styles.container}>
            <FormInput
                name="currentPassword"
                control={form.control}
                label="Current password"
                placeholder="*********"
                leftIcon={<Lock color={theme.colors.grey[400]} size={20} />}
            />
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
                label="Confirm new password"
                placeholder="*********"
                leftIcon={<Lock color={theme.colors.grey[400]} size={20} />}
            />
            <Button
                label="Update password"
                disabled={
                    !form.formState.isValid || ChangePasswordMutation.isPending
                }
                isLoading={ChangePasswordMutation.isPending}
                onPress={form.handleSubmit(handleFormSubmit)}
            />
        </View>
    );
};

export default ChangePasswordForm;

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
});

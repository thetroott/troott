import { StyleSheet, View } from 'react-native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/components/ui/button';
import TermsAndConditions from '@/components/features/auth/TermsConditions';
import { theme } from '@/constants/theme';
import { useForgotPasswordAuth } from '@/context';
import { EmailSchema, EmailSchemaType } from '@/validation/email';
import FormInput from '@/components/ui/forminput';
import { Sms } from 'iconsax-react-nativejs';
import { useAuth } from '@/api/hooks/app/useAuth';

const ForgotPasswordForm = () => {
    const { setFormData } = useForgotPasswordAuth();
    const { SendOtpMutation } = useAuth();

    const form = useForm<EmailSchemaType>({
        defaultValues: {
            email: '',
        },
        resolver: zodResolver(EmailSchema),
    });

    const handleFormSubmit = (data: EmailSchemaType) => {
        const email = data.email.trim().toLowerCase();
        setFormData({ email });
        SendOtpMutation.mutate({ email });
    };

    return (
        <View style={styles.container}>
            <FormInput
                name="email"
                control={form.control}
                label="email"
                leftIcon={<Sms color={theme.colors.grey[400]} size={20} />}
                containerStyle={{ width: theme.sizes.screen.width * 0.45 }}
            />
            <TermsAndConditions />
            <Button
                label="Continue"
                disabled={
                    !form.formState.isValid || SendOtpMutation.isPending
                }
                isLoading={SendOtpMutation.isPending}
                onPress={form.handleSubmit(handleFormSubmit)}
            />
        </View>
    );
};

export default ForgotPasswordForm;

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
});

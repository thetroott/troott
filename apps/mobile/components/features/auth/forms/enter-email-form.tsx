import { StyleSheet, View } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/components/ui/button';
import TermsAndConditions from '@/components/features/auth/TermsConditions';
import { router } from 'expo-router';
import { useRegisterAuth } from '@/context';
import { EmailSchema, EmailSchemaType } from '@/validation/email';
import FormInput from '@/components/ui/forminput';
import { Sms } from 'iconsax-react-nativejs';
import OAuth from '@/components/features/auth/OAuth';
import { theme } from '@/constants/theme';
import storage from '@/api/services/mmkv-storage';

const EnterEmailForm = () => {
    const { email, setEmail, setField, setUserEmail } = useRegisterAuth();
    const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const form = useForm<EmailSchemaType>({
        defaultValues: {
            email: email || '',
        },
        resolver: zodResolver(EmailSchema),
    });

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            if (email?.trim()) {
                form.setValue('email', email);
                return;
            }
            const stored = await storage.getUserEmail();
            if (cancelled || !stored) return;
            setEmail(stored);
            setField('email', stored);
            form.setValue('email', stored);
        })();

        return () => {
            cancelled = true;
        };
    }, [email, form, setEmail, setField]);

    const watchedEmail = form.watch('email');

    useEffect(() => {
        if (persistTimerRef.current) {
            clearTimeout(persistTimerRef.current);
        }

        persistTimerRef.current = setTimeout(() => {
            const normalized = (watchedEmail ?? '').trim().toLowerCase();
            if (!normalized) return;
            setEmail(normalized);
            setField('email', normalized);
            void storage.setUserEmail(normalized);
        }, 300);

        return () => {
            if (persistTimerRef.current) {
                clearTimeout(persistTimerRef.current);
            }
        };
    }, [watchedEmail, setEmail, setField]);

    const handleFormSubmit = (data: EmailSchemaType) => {
        const normalized = data.email.trim().toLowerCase();
        setEmail(normalized);
        setField('email', normalized);
        void storage.setUserEmail(normalized);
        setUserEmail(true);
        router.push('/register');
    };

    return (
        <View style={styles.container}>
            <TermsAndConditions />

            <FormInput
                name="email"
                control={form.control}
                label="Email Address"
                leftIcon={<Sms color={theme.colors.grey[400]} size={20} />}
            />

            <Button
                label="Continue"
                disabled={!form.formState.isValid}
                onPress={form.handleSubmit(handleFormSubmit)}
            />

            <OAuth />
        </View>
    );
};

export default EnterEmailForm;

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
});

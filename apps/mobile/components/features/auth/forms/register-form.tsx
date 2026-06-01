import { StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import FormInput from '@/components/ui/forminput';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Sms, User } from 'iconsax-react-nativejs';
import { theme } from '@/constants/theme';
import Button from '@/components/ui/button';
import { SignupSchema, SignupSchemaType } from '@/validation/signup';
import { useRegisterAuth } from '@/context';
import TermsAndConditions from '@/components/features/auth/TermsConditions';
import { useAuth } from '@/api/hooks/app/useAuth';
import { UserType } from '@/models/User.model';
import storage from '@/api/services/mmkv-storage';

const SignUpform = () => {
    const { email, userEmail, setEmail, setField } = useRegisterAuth();
    const { RegisterMutation } = useAuth();

    const form = useForm<SignupSchemaType>({
        defaultValues: {
            first_name: '',
            last_name: '',
            email: email || '',
            password: '',
        },
        resolver: zodResolver(SignupSchema),
    });

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            let resolved = email?.trim() ?? '';
            if (!resolved) {
                resolved = (await storage.getUserEmail()) || '';
            }
            if (cancelled || !resolved) return;
            setEmail(resolved);
            setField('email', resolved);
            form.setValue('email', resolved);
        })();

        return () => {
            cancelled = true;
        };
    }, [email, form, setEmail, setField]);

    useEffect(() => {
        if (email?.trim()) {
            form.setValue('email', email);
        }
    }, [email, form]);

    function handleSubmit(data: SignupSchemaType) {
        const normalizedEmail = data.email.trim().toLowerCase();
        setField('firstName', data.first_name.trim());
        setField('lastName', data.last_name.trim());
        setField('email', normalizedEmail);
        setField('password', data.password);
        setField('userType', UserType.LISTENER);
        setEmail(normalizedEmail);
        void storage.setUserEmail(normalizedEmail);
        RegisterMutation.mutate({
            firstName: data.first_name.trim(),
            lastName: data.last_name.trim(),
            email: normalizedEmail,
            password: data.password,
            userType: UserType.LISTENER,
        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.nameContainer}>
                <FormInput
                    name="first_name"
                    control={form.control}
                    label="First Name"
                    leftIcon={<User color={theme.colors.grey[400]} size={20} />}
                    containerStyle={{ width: theme.sizes.screen.width * 0.45 }}
                />
                <FormInput
                    name="last_name"
                    control={form.control}
                    label="Last Name"
                    leftIcon={<User color={theme.colors.grey[400]} size={20} />}
                    containerStyle={{ width: theme.sizes.screen.width * 0.45 }}
                />
            </View>
            <FormInput
                name="email"
                control={form.control}
                label="Email"
                leftIcon={<Sms color={theme.colors.grey[400]} size={20} />}
                editable={!userEmail}
            />
            <FormInput
                name="password"
                control={form.control}
                label="Password"
                placeholder="*********"
                leftIcon={<Lock color={theme.colors.grey[400]} size={20} />}
            />

            <TermsAndConditions />

            <Button
                onPress={form.handleSubmit(handleSubmit)}
                disabled={
                    !form.formState.isValid || RegisterMutation.isPending
                }
                isLoading={RegisterMutation.isPending}
                label="Continue"
            />
        </View>
    );
};

export default SignUpform;

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
    nameContainer: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});

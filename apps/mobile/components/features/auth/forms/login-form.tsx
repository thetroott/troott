import { StyleSheet, View, Pressable } from 'react-native';
import React from 'react';
import FormInput from '@/components/ui/forminput';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Sms } from 'iconsax-react-nativejs';
import { theme } from '@/constants/theme';
import Button from '@/components/ui/button';
import Text from '@/components/ui/text';
import { LoginSchema, LoginSchemaType } from '@/validation/login';
import { useTrackStore } from '@/engine/state/player-ui-store';
import { useAuth } from '@/api/hooks/app/useAuth';
import { router } from 'expo-router';

const LoginForm = () => {
    const { LoginMutation } = useAuth();
    const setShowFullPlayer = useTrackStore((s) => s.setShowFullPlayer);
    const setFullPlayerReturnPath = useTrackStore(
        (s) => s.setFullPlayerReturnPath,
    );

    const form = useForm<LoginSchemaType>({
        defaultValues: {
            email: '',
            password: '',
        },
        resolver: zodResolver(LoginSchema),
    });

    function handleSubmit(data: LoginSchemaType) {
        setShowFullPlayer(false);
        setFullPlayerReturnPath(null);
        LoginMutation.mutate({
            email: data.email.trim().toLowerCase(),
            password: data.password,
        });
    }

    return (
        <View style={styles.container}>
            <FormInput
                name="email"
                control={form.control}
                label="Email"
                placeholder="john.alabi@mail.com"
                leftIcon={<Sms color={theme.colors.grey[400]} size={20} />}
            />
            <FormInput
                name="password"
                control={form.control}
                label="Password"
                placeholder="*********"
                leftIcon={<Lock color={theme.colors.grey[400]} size={20} />}
            />
            <Pressable onPress={() => router.push('/reset-password-otp-request')}>
                <Text size="sm" color={theme.colors.teal[500]}>
                    Forgot password?
                </Text>
            </Pressable>
            <Button
                onPress={form.handleSubmit(handleSubmit)}
                disabled={
                    !form.formState.isValid || LoginMutation.isPending
                }
                isLoading={LoginMutation.isPending}
                label="Continue"
            />
        </View>
    );
};

export default LoginForm;

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
});

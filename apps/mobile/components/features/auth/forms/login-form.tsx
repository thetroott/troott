import { StyleSheet, View } from 'react-native';
import React from 'react';
import FormInput from '@/components/ui/forminput';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Sms } from 'iconsax-react-nativejs';
import { theme } from '@/constants/theme';
import Button from '@/components/ui/button';

import { router } from 'expo-router';
import { LoginSchema, LoginSchemaType } from '@/validation/login';
import { useTrackStore } from '@/stores/player-store';
import { replaceWithPendingTargetOrHome } from '@/lib/deep-link/replace-with-pending-or-home';

const LoginForm = () => {
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
    async function handleSubmit(_data: LoginSchemaType) {
        setShowFullPlayer(false);
        setFullPlayerReturnPath(null);
        await replaceWithPendingTargetOrHome();
    }
    const handleFormSubmit = () => {
        router.push('/select-ministers');
    };
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
            <Button
                onPress={form.handleSubmit(handleSubmit)}
                disabled={!form.formState.isValid}
                label="Continue"
            ></Button>
        </View>
    );
};

export default LoginForm;

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

import { theme } from '@/constants/theme';
import { Stack } from 'expo-router';

const AuthLayout = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: theme.colors.grey[950],
                },
            }}
        />
    );
};

export default AuthLayout;

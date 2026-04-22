import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '@/constants/theme';

const OnboardingLayout = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    flex: 1,
                    backgroundColor: theme.colors.grey[900],
                },
            }}
        />
    );
};

export default OnboardingLayout;

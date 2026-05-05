import React from 'react';
import { Stack } from 'expo-router';

import { theme } from '@/constants/theme';

export default function PickersLayout() {
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
}

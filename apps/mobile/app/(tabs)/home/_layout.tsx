import React from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { theme } from '@/constants/theme';

export default function HomeStackLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: theme.colors.grey[900],
                    flex: 1,
                    marginTop: Platform.select({
                        ios: 10,
                        android: 5,
                    }),
                },
            }}
        >
            <Stack.Screen name="index" />
        </Stack>
    );
}

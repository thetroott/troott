import React from 'react';
import { Stack } from 'expo-router';

export default function UserLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="empty" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen
                name="photo-picker"
                options={{ presentation: 'fullScreenModal' }}
            />
            <Stack.Screen name="edit-profile-saved" />
            <Stack.Screen name="about-troott" />
            <Stack.Screen name="notifications" />
        </Stack>
    );
}

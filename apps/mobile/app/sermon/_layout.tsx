import { Platform, StyleSheet } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '@/constants/theme';

const TrackLayout = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                contentStyle: {
                    backgroundColor: theme.colors.grey[900],
                    flex: 1,
                    marginTop: Platform.select({
                        ios: 80,
                        android: 60,
                    }),
                },
            }}
        >
            <Stack.Screen
                name="user-playlist-add-track"
                options={{
                    presentation: 'modal',
                }}
            />
            <Stack.Screen name="create-playlist" />
        </Stack>
    );
};

export default TrackLayout;

const styles = StyleSheet.create({});

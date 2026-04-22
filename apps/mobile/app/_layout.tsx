import { AppState, Platform, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { matterFonts } from '@/constants/typography';
import { ONE_DAY, queryClient } from '@/services/query-client';
import CustomSplashScreen from '@/components/features/shared/splash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalHost } from '@/components/ui/portal';
import { theme } from '@/constants/theme';
import { Toaster } from '@/components/ui/toast';
import { requestStoragePermission } from '@/lib/permisson-helpers';
import { queryClientPersister } from '@/services/storage';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { enableScreens } from 'react-native-screens';
import { startPlayerService } from '@/engine/player/setup';
import Initialize from '@/engine/helpers/initialization';
import { useUpdateOptions } from '@/engine/player/useUpdateOptions';
import { attachEnginePlaybackListeners } from '@/engine/player/background';
import { mergeLastPlayedPosition } from '@/engine/state/last-played-sync';
import { usePendingDeepLinkBootstrap } from '@/lib/deep-link/use-pending-deeplink-bootstrap';
import MiniPlayer from '@/components/features/player/mini-player/mini-player';
import { EmbeddedBridgeGuard } from '@/components/dev/EmbeddedBridgeGuard';
import TrackPlayer from '@rntp/player';

enableScreens(true);

// Prevent splash from auto hiding
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
    usePendingDeepLinkBootstrap();

    const [fontsLoaded, fontError] = useFonts(matterFonts);
    const [playerIsReady, setPlayerIsReady] = useState<boolean>(false);
    const androidSetupRetryRef = useRef(false);
    const playerListenersAttachedRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        const bootstrapPlayer = async () => {
            try {
                await startPlayerService();
                await Initialize();
                await useUpdateOptions(false);
                if (!cancelled && !playerListenersAttachedRef.current) {
                    attachEnginePlaybackListeners();
                    playerListenersAttachedRef.current = true;
                }
                if (!cancelled) {
                    setPlayerIsReady(true);
                    androidSetupRetryRef.current = false;
                }
            } catch (error: unknown) {
                const message =
                    error && typeof error === 'object' && 'message' in error
                        ? String((error as { message: unknown }).message)
                        : String(error);
                const code =
                    error && typeof error === 'object' && 'code' in error
                        ? String((error as { code: unknown }).code)
                        : '';

                if (
                    Platform.OS === 'android' &&
                    (code === 'android_cannot_setup_player_in_background' ||
                        message.includes(
                            'android_cannot_setup_player_in_background',
                        ))
                ) {
                    console.warn(
                        '[Player] Setup deferred until app is foreground:',
                        message,
                    );
                    androidSetupRetryRef.current = true;
                    if (!cancelled) setPlayerIsReady(true);
                    return;
                }

                console.error('[Player] Bootstrap failed:', error);
                if (!cancelled) {
                    setPlayerIsReady(true);
                }
            }
        };

        void bootstrapPlayer();
        requestStoragePermission();

        const sub = AppState.addEventListener('change', (state) => {
            if (
                state !== 'active' ||
                !androidSetupRetryRef.current ||
                cancelled
            )
                return;
            void bootstrapPlayer();
        });

        return () => {
            cancelled = true;
            sub.remove();
        };
    }, []);

    useEffect(() => {
        if (!playerIsReady) return;
        const sub = AppState.addEventListener('change', (state) => {
            if (state !== 'background' && state !== 'inactive') return;
            try {
                const { position, duration } = TrackPlayer.getProgress();
                mergeLastPlayedPosition(position, duration);
            } catch {
                /* player not initialized */
            }
        });
        return () => sub.remove();
    }, [playerIsReady]);

    // Hide splash screen once fonts and player are ready
    useEffect(() => {
        if (fontsLoaded && playerIsReady) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, playerIsReady]);

    // Show splash until fonts AND player are ready
    if (!fontsLoaded || !playerIsReady || fontError) {
        return <CustomSplashScreen />;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <PersistQueryClientProvider
                    client={queryClient}
                    persistOptions={{
                        persister: queryClientPersister,
                        /**
                         * Maximum query data age of one day
                         */
                        maxAge: ONE_DAY,
                    }}
                >
                    <SafeAreaView
                        style={{
                            flex: 1,
                            backgroundColor: theme.colors.black[50],
                        }}
                    >
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="index" />
                            <Stack.Screen
                                name="(auth)"
                                options={{
                                    presentation: 'modal',
                                }}
                            />
                            <Stack.Screen name="(onboarding)" />
                            <Stack.Screen
                                name="player"
                                options={{
                                    presentation: 'fullScreenModal',
                                    animation: 'slide_from_bottom',
                                }}
                            />
                        </Stack>
                        <MiniPlayer />
                        <StatusBar style="light" />
                        {/*
                         * Portals (bottom sheet, etc.) must stack above the mini player (zIndex 50
                         * on the player shell). Same-level siblings without a higher z-index sit under it.
                         */}
                        <View
                            pointerEvents="box-none"
                            style={{
                                zIndex: 200,
                                elevation: 20,
                            }}
                        >
                            <PortalHost />
                        </View>
                        <Toaster />
                        <EmbeddedBridgeGuard />
                    </SafeAreaView>
                </PersistQueryClientProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
};

export default RootLayout;

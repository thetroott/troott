import { TroottProviders } from '@/context/providers';
import { PlaybackBridge } from '@/engine/state/use-playback-bridge';
import { PlaybackProgressSync } from '@/engine/playback/use-sync-playback-progress';
import Constants from 'expo-constants';
import { AppState, PermissionsAndroid, Platform, Share, StyleSheet, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SplashScreen, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { matterFonts } from '@/constants/typography';
import { ONE_DAY, queryClient } from '@/api/services/query-client';
import CustomSplashScreen from '@/components/features/shared/splash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalHost } from '@/components/ui/portal';
import { theme } from '@/constants/theme';
import { Toaster } from '@/components/ui/toast';
import { queryClientPersister } from '@/api/services/mmkv-storage';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { enableScreens } from 'react-native-screens';
import { startPlayerService } from '@/engine/player/setup';
import Initialize from '@/engine/helpers/initialization';
import { useUpdateOptions } from '@/engine/player/useUpdateOptions';
import { attachEnginePlaybackListeners } from '@/engine/player/background';
import { mergeLastPlayedPosition } from '@/engine/state/last-played-sync';
import MiniPlayer from '@/components/features/player/mini-player/mini-player';
import { EmbeddedBridgeGuard } from '@/components/dev/EmbeddedBridgeGuard';
import TrackPlayer from '@rntp/player';
import { ListenerSharingFlow } from '@/components/features/share';
import { useShareFlow } from '@/lib/state/share-flow';
import { FullWindowOverlay } from 'react-native-screens';
import { Portal } from '@/components/ui/portal';
import { GlobalLoadingPortal } from '@/components/ui/loading-state';
import { initNetworkStoreSync } from '@/lib/state/network-store';
import InternetConnectionWatcher from '@/components/features/shared/network-watcehr';

const AUTH_PUBLIC_PATHS = new Set([
    '/',
    '/login',
    '/register',
    '/enter-email',
    '/verify-email',
    '/activate-user-account',
    '/reset-password-otp-request',
    '/request-password-otp',
    '/reset-password',
    '/accept-invite',
]);

function normalizeShellPath(pathname: string): string {
    const base = (pathname.split('?')[0] ?? '').replace(/\/$/, '');
    return base || '/';
}

function isAuthPublicPath(pathname: string): boolean {
    const path = normalizeShellPath(pathname);
    if (AUTH_PUBLIC_PATHS.has(path)) {
        return true;
    }
    return path.startsWith('/(auth)');
}

function shouldAllowMiniPlayer(pathname: string): boolean {
    const base = normalizeShellPath(pathname);
    if (base === '/' || base === '') return false;
    if (isAuthPublicPath(base)) return false;
    if (base === '/select-ministers' || base === '/select-interests') return false;
    return true;
}

function getSharingModule(): {
    isAvailableAsync: () => Promise<boolean>;
    shareAsync: (url: string) => Promise<void>;
} | null {
    try {
        return require('expo-sharing') as {
            isAvailableAsync: () => Promise<boolean>;
            shareAsync: (url: string) => Promise<void>;
        };
    } catch {
        return null;
    }
}

enableScreens(true);

// Prevent splash from auto hiding
SplashScreen.preventAutoHideAsync();

const QUERY_PERSIST_APP_VERSION =
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    'unknown';

import { resolveShareUrl } from '@/engine/utils/share-url';

const RootLayout = () => {
    const pathname = usePathname();

    useEffect(() => {
        const disconnect = initNetworkStoreSync();
        return disconnect;
    }, []);

    const [fontsLoaded, fontError] = useFonts(matterFonts);
    const [playerIsReady, setPlayerIsReady] = useState<boolean>(false);
    const androidSetupRetryRef = useRef(false);
    const playerListenersAttachedRef = useRef(false);
    const { visible, step, track, close, setStep } = useShareFlow();
    const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const shouldHideMiniPlayer = !shouldAllowMiniPlayer(pathname);

    const buildShareUrl = useCallback(async () => {
        return resolveShareUrl({
            sermonId: track.id,
            shareableUrl: track.shareableUrl,
            title: track.title,
        });
    }, [track.id, track.shareableUrl, track.title]);

    const handleCopyToClipboard = useCallback(async () => {
        const url = await buildShareUrl();
        try {
            // Lazy-require so missing native `ExpoClipboard` (web, stale dev client) does not crash app startup.
            const Clipboard = require('expo-clipboard') as typeof import('expo-clipboard');
            await Clipboard.setStringAsync(url);
        } catch (error) {
            console.error('[Share] Clipboard.setStringAsync failed:', error);
            try {
                await Share.share({ message: url, url });
            } catch {
                /* ignore */
            }
            close();
            return;
        }
        setStep('copy-toast');

        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = setTimeout(() => {
            close();
            toastTimeoutRef.current = null;
        }, 1200);
    }, [buildShareUrl, close, setStep]);

    const handleOpenNativeShare = useCallback(async () => {
        const url = await buildShareUrl();
        const message = `Listen to ${track.title ?? 'this sermon'} on Troott`;

        try {
            const sharing = getSharingModule();
            // expo-sharing may not support raw HTTP urls on all platforms;
            // fallback to RN Share for URL/text payloads.
            const sharingAvailable = sharing
                ? await sharing.isAvailableAsync()
                : false;
            if (sharingAvailable) {
                await sharing?.shareAsync(url);
            } else {
                await Share.share({ message: `${message}\n${url}`, url });
            }
        } catch {
            await Share.share({ message: `${message}\n${url}`, url });
        } finally {
            close();
        }
    }, [buildShareUrl, close, track.title]);

    const handlePressInstagram = useCallback(async () => {
        const url = await buildShareUrl();
        const message = `Listen to ${track.title ?? 'this sermon'} on Troott`;
        try {
            await Share.share({ message: `${message}\n${url}`, url });
        } catch {
            /* ignore */
        } finally {
            close();
        }
    }, [buildShareUrl, close, track.title]);

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
        if (Platform.OS === 'android') {
            void PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            ]).catch((err) => {
                console.warn(err);
            });
        }

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

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }
        };
    }, []);

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
                        /** Drop persisted cache when the app version changes (install / OTA). */
                        buster: QUERY_PERSIST_APP_VERSION,
                    }}
                >
                    <TroottProviders>
                        <PlaybackBridge />
                        <PlaybackProgressSync />
                    <SafeAreaView
                        style={{
                            flex: 1,
                            backgroundColor: theme.colors.black[50],
                        }}
                    >
                        <InternetConnectionWatcher />
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="index" />
                            <Stack.Screen
                                name="(tabs)"
                                options={{ headerShown: false }}
                            />
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
                            <Stack.Screen
                                name="user"
                                options={{
                                    presentation: 'fullScreenModal',
                                    animation: 'slide_from_right',
                                }}
                            />
                            <Stack.Screen
                                name="(pickers)"
                                options={{
                                    presentation: 'modal',
                                    animation: 'slide_from_bottom',
                                }}
                            />
                        </Stack>
                        {!shouldHideMiniPlayer ? <MiniPlayer /> : null}
                        <StatusBar style="light" />
                        {/*
                         * Portals (bottom sheet, etc.) must stack above the mini player (zIndex 50
                         * on the player shell). Same-level siblings without a higher z-index sit under it.
                         */}
                        {Platform.OS === 'ios' ? (
                            <FullWindowOverlay>
                                <View
                                    pointerEvents="box-none"
                                    style={styles.portalLayer}
                                >
                                    <PortalHost />
                                </View>
                            </FullWindowOverlay>
                        ) : (
                            <View
                                pointerEvents="box-none"
                                style={styles.portalLayer}
                            >
                                <PortalHost />
                            </View>
                        )}
                        <GlobalLoadingPortal />
                        <Toaster />
                        <EmbeddedBridgeGuard />
                        <Portal name="listener-sharing-flow">
                            <ListenerSharingFlow
                                visible={visible}
                                step={step}
                                track={track}
                                onDismiss={close}
                                onPressCopy={handleCopyToClipboard}
                                onPressInstagram={handlePressInstagram}
                                onPressMoreOptions={handleOpenNativeShare}
                            />
                        </Portal>
                    </SafeAreaView>
                    </TroottProviders>
                </PersistQueryClientProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
};

export default RootLayout;

const styles = StyleSheet.create({
    portalLayer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 5000,
        elevation: 5000,
    },
});

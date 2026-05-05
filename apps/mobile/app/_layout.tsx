import Constants from 'expo-constants';
import { AppState, Platform, Share, StyleSheet, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SplashScreen, Stack, usePathname } from 'expo-router';
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
import { ListenerSharingFlow } from '@/components/features/share';
import { useShareFlow } from '@/stores/app/share';
import { FullWindowOverlay } from 'react-native-screens';
import { Portal } from '@/components/ui/portal';
import { GlobalLoadingPortal } from '@/components/ui/loading-state';

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

const RootLayout = () => {
    usePendingDeepLinkBootstrap();
    const pathname = usePathname();

    const [fontsLoaded, fontError] = useFonts(matterFonts);
    const [playerIsReady, setPlayerIsReady] = useState<boolean>(false);
    const androidSetupRetryRef = useRef(false);
    const playerListenersAttachedRef = useRef(false);
    const { visible, step, track, close, setStep } = useShareFlow();
    const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pathOnly = (pathname.split('?')[0] ?? '').replace(/\/$/, '') || '/';
    const shouldHideMiniPlayer =
        pathOnly === '/user/edit-profile' ||
        pathOnly === '/user/photo-picker' ||
        pathOnly === '/user/edit-profile-saved' ||
        pathOnly === '/playlist/create-playlist' ||
        pathOnly.startsWith('/see-more');

    const buildShareUrl = useCallback(() => {
        if (track.id != null && String(track.id).length > 0) {
            return `https://app.troott.com/track/${track.id}`;
        }
        const slug = (track.title ?? 'sermon')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-');
        return `https://app.troott.com/track/${encodeURIComponent(slug)}`;
    }, [track.id, track.title]);

    const handleCopyToClipboard = useCallback(async () => {
        const url = buildShareUrl();
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
        const url = buildShareUrl();
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
                    <SafeAreaView
                        style={{
                            flex: 1,
                            backgroundColor: theme.colors.black[50],
                        }}
                    >
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
                                onPressMoreOptions={handleOpenNativeShare}
                            />
                        </Portal>
                    </SafeAreaView>
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

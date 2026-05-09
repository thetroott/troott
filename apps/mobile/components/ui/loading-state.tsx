import React from 'react';
import { StyleSheet, View } from 'react-native';
import { create } from '@/lib/zstore';

import Text from '@/components/ui/text';
import Loader from '@/components/ui/loader';
import { theme } from '@/constants/theme';

type LoadingVariant = 'inline' | 'overlay' | 'fullscreen';

type LoadingStateProps = {
    variant?: LoadingVariant;
    label?: string;
    visible?: boolean;
};

/** Supports `show('…')` or mistaken `show({ label, variant })` without crashing Text. */
type GlobalLoadingShowArg = string | { label?: string; variant?: LoadingVariant };

type GlobalLoadingStore = {
    visible: boolean;
    label?: string;
    show: (arg?: GlobalLoadingShowArg) => void;
    hide: () => void;
};

function normalizeLoadingLabel(arg?: GlobalLoadingShowArg): string | undefined {
    if (arg == null) return undefined;
    if (typeof arg === 'string') return arg;
    const l = arg.label;
    return typeof l === 'string' ? l : undefined;
}

const useGlobalLoadingStore = create<GlobalLoadingStore>((set) => ({
    visible: false,
    label: undefined,
    show: (arg) =>
        set({
            visible: true,
            label: normalizeLoadingLabel(arg),
        }),
    hide: () => set({ visible: false, label: undefined }),
}));

/**
 * Shared loading UI for fullscreen pages, modal/sheet overlays, and inline sections.
 * It always centers the indicator and optional label.
 */
export function LoadingState({
    variant = 'inline',
    label,
    visible = true,
}: LoadingStateProps) {
    if (!visible) return null;

    const labelText = normalizeLoadingLabel(label);

    return (
        <View style={[styles.base, stylesByVariant[variant]]}>
            <Loader />
            {labelText ? (
                <Text
                    size="sm"
                    color={theme.colors.grey[300]}
                    style={styles.label}
                >
                    {labelText}
                </Text>
            ) : null}
        </View>
    );
}

/**
 * Global loading controls for long-running actions (network, bootstrap, etc.).
 */
export function useGlobalLoading() {
    const show = useGlobalLoadingStore((s) => s.show);
    const hide = useGlobalLoadingStore((s) => s.hide);
    return { show, hide };
}

/**
 * App-level loading layer mounted once in root layout.
 */
export function GlobalLoadingPortal() {
    const visible = useGlobalLoadingStore((s) => s.visible);
    const label = useGlobalLoadingStore((s) => s.label);

    if (!visible) return null;

    return (
        <View style={styles.globalRoot} pointerEvents="auto">
            <LoadingState variant="overlay" label={label} />
        </View>
    );
}

const stylesByVariant = StyleSheet.create({
    inline: {
        minHeight: 96,
        borderRadius: theme.sizes.radius.base,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    fullscreen: {
        flex: 1,
    },
});

const styles = StyleSheet.create({
    base: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.sizes.spacing.sm,
    },
    label: {
        textAlign: 'center',
    },
    globalRoot: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9000,
        elevation: 9000,
    },
});

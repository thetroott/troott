import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { create } from '@/lib/zstore';
import { useEffect } from 'react';
import React from 'react';

// --- Store + API (Sonner-like) ---
type ToastType =
    | 'success'
    | 'error'
    | 'info'
    | 'warning'
    | 'loading'
    | 'default';
type Action = {
    label: string;
    onPress: () => void;
};

interface ToastItem {
    id: string;
    title: string;
    description?: string;
    type?: ToastType;
    action?: Action;
    jsx?: React.ReactNode;
}

interface ToastStore {
    toasts: ToastItem[];
    show: (toast: Omit<ToastItem, 'id'>) => string;
    dismiss: (id?: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    show: (toast) => {
        const id = Math.random().toString();
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id }],
        }));
        return id;
    },
    dismiss: (id) => {
        if (id) {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }));
        } else {
            set({ toasts: [] });
        }
    },
}));

export const toast = {
    success: (title: string, description?: string) =>
        useToastStore.getState().show({ title, description, type: 'success' }),
    error: (title: string, description?: string) =>
        useToastStore.getState().show({ title, description, type: 'error' }),
    info: (title: string, description?: string) =>
        useToastStore.getState().show({ title, description, type: 'info' }),
    message: (title: string, description?: string) =>
        useToastStore.getState().show({ title, description, type: 'default' }),
    dismiss: (id?: string) => useToastStore.getState().dismiss(id),

    promise: (
        promise: Promise<any>,
        data: {
            loading: string;
            success: string;
            error: string;
        },
    ) => {
        const id = useToastStore
            .getState()
            .show({ title: data.loading, type: 'loading' });

        promise
            .then(() => {
                useToastStore.getState().dismiss(id);
                useToastStore
                    .getState()
                    .show({ title: data.success, type: 'success' });
            })
            .catch(() => {
                useToastStore.getState().dismiss(id);
                useToastStore
                    .getState()
                    .show({ title: data.error, type: 'error' });
            });

        return id;
    },
};

const TOAST_COLORS: Record<ToastType, string> = {
    success: '#16a34a',
    error: '#dc2626',
    info: '#2563eb',
    warning: '#ca8a04',
    loading: '#ca8a04',
    default: '#27272a',
};

const AUTO_DISMISS_MS = 4000;

function ToastCard({ toast: t }: { toast: ToastItem }) {
    useEffect(() => {
        if (t.type === 'loading') {
            return;
        }

        const timer = setTimeout(() => {
            useToastStore.getState().dismiss(t.id);
        }, AUTO_DISMISS_MS);

        return () => clearTimeout(timer);
    }, [t.id, t.type]);

    const backgroundColor = TOAST_COLORS[t.type ?? 'default'];

    return (
        <Animated.View
            entering={FadeInDown}
            exiting={FadeOutUp}
            style={{ marginBottom: 8 }}
        >
            <View
                style={{
                    borderRadius: 16,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 8,
                    backgroundColor,
                }}
            >
                {t.jsx ? (
                    t.jsx
                ) : (
                    <>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                            {t.title}
                        </Text>
                        {t.description ? (
                            <Text style={{ color: '#ffffffcc', marginTop: 4 }}>
                                {t.description}
                            </Text>
                        ) : null}
                        {t.action ? (
                            <Pressable
                                onPress={t.action.onPress}
                                style={{ marginTop: 8 }}
                            >
                                <Text
                                    style={{
                                        color: '#fff',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {t.action.label}
                                </Text>
                            </Pressable>
                        ) : null}
                        <Pressable
                            onPress={() =>
                                useToastStore.getState().dismiss(t.id)
                            }
                        >
                            <Text style={{ color: '#fff', marginTop: 8 }}>
                                Dismiss
                            </Text>
                        </Pressable>
                    </>
                )}
            </View>
        </Animated.View>
    );
}

export function Toaster() {
    const toasts = useToastStore((s) => s.toasts);

    return (
        <View
            pointerEvents="box-none"
            style={{
                position: 'absolute',
                top: 56,
                left: 0,
                right: 0,
                paddingHorizontal: 16,
                zIndex: 10000,
                elevation: 10000,
            }}
        >
            {toasts.map((t) => (
                <ToastCard key={t.id} toast={t} />
            ))}
        </View>
    );
}

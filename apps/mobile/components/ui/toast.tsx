// components/ui/Toaster.tsx
import { View, Text, Pressable } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { create } from "zustand";
import { useEffect } from "react";
import React from 'react';

import { Root, Title, Description } from "@rn-primitives/toast";

// --- Store + API (Sonner-like) ---
type ToastType = "success" | "error" | "info" | "warning" | "loading" | "default";
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
  show: (toast: Omit<ToastItem, "id">) => string;
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
    useToastStore.getState().show({ title, description, type: "success" }),
  error: (title: string, description?: string) =>
    useToastStore.getState().show({ title, description, type: "error" }),
  info: (title: string, description?: string) =>
    useToastStore.getState().show({ title, description, type: "info" }),
  message: (title: string, description?: string) =>
    useToastStore.getState().show({ title, description, type: "default" }),
  dismiss: (id?: string) => useToastStore.getState().dismiss(id),

  // New Promise method inspired by Sonner
  promise: (
    promise: Promise<any>,
    data: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    // Show a loading toast immediately
    const id = useToastStore.getState().show({ title: data.loading, type: "loading" });

    // Handle the promise lifecycle
    promise
      .then(() => {
        // Dismiss loading toast and show success toast
        useToastStore.getState().dismiss(id);
        useToastStore.getState().show({ title: data.success, type: "success" });
      })
      .catch(() => {
        // Dismiss loading toast and show error toast
        useToastStore.getState().dismiss(id);
        useToastStore.getState().show({ title: data.error, type: "error" });
      });

    return id;
  },
};

// --- UI Layer ---
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <View
      style={{
        position: "absolute",
        bottom: 32,
        width: "100%",
        paddingHorizontal: 16,
        zIndex: 9999,
      }}
    >
      {toasts.map((t) => {
        useEffect(() => {
          const timer = setTimeout(() => {
            useToastStore.getState().dismiss(t.id);
          }, 4000);
          return () => clearTimeout(timer);
        }, [t.id]);

        const backgroundColor =
          t.type === "success"
            ? "#16a34a"
            : t.type === "error"
            ? "#dc2626"
            : t.type === "info"
            ? "#2563eb"
            : t.type === "loading"
            ? "#ca8a04" // New color for loading state
            : "#27272a";

        return (
          <Animated.View
            key={t.id}
            entering={FadeInDown}
            exiting={FadeOutUp}
            style={{ marginBottom: 8 }}
          >
            <Root
              open={true}
              onOpenChange={(open) => {
                if (!open) {
                  useToastStore.getState().dismiss(t.id);
                }
              }}
              style={{
                borderRadius: 16,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
                backgroundColor,
              }}
            >
              {/* Conditionally render JSX or default content */}
              {t.jsx ? (
                t.jsx
              ) : (
                <>
                  <Title style={{ color: "#fff", fontWeight: "bold" }}>{t.title}</Title>
                  {t.description && (
                    <Description style={{ color: "#ffffffcc" }}>{t.description}</Description>
                  )}
                  {/* Conditionally render action button */}
                  {t.action && (
                    <Pressable onPress={t.action.onPress} style={{ marginTop: 8 }}>
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>{t.action.label}</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={() => useToastStore.getState().dismiss(t.id)}>
                    <Text style={{ color: "#fff", marginTop: 8 }}>Dismiss</Text>
                  </Pressable>
                </>
              )}
            </Root>
          </Animated.View>
        );
      })}
    </View>
  );
}
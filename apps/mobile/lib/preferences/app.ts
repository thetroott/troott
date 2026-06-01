import { mmkvStateStorage } from '@/api/services/mmkv-storage';
import { create, createJSONStorage, devtools, persist, useShallow } from '@/lib/zstore';

type AppSettingsStore = {
    sendMetrics: boolean;
    setSendMetrics: (sendMetrics: boolean) => void;

    hideRunTimes: boolean;
    setHideRunTimes: (hideRunTimes: boolean) => void;

    reducedHaptics: boolean;
    setReducedHaptics: (reducedHaptics: boolean) => void;

    pushNotificationsEnabled: boolean;
    setPushNotificationsEnabled: (enabled: boolean) => void;

    inAppNotificationsEnabled: boolean;
    setInAppNotificationsEnabled: (enabled: boolean) => void;
};

export const useAppSettingsStore = create<AppSettingsStore>()(
    devtools(
        persist(
            (set): AppSettingsStore => ({
                sendMetrics: false,
                setSendMetrics: (sendMetrics: boolean) => set({ sendMetrics }),

                hideRunTimes: false,
                setHideRunTimes: (hideRunTimes: boolean) =>
                    set({ hideRunTimes }),

                reducedHaptics: false,
                setReducedHaptics: (reducedHaptics: boolean) =>
                    set({ reducedHaptics }),

                pushNotificationsEnabled: true,
                setPushNotificationsEnabled: (pushNotificationsEnabled: boolean) =>
                    set({ pushNotificationsEnabled }),

                inAppNotificationsEnabled: true,
                setInAppNotificationsEnabled: (
                    inAppNotificationsEnabled: boolean,
                ) => set({ inAppNotificationsEnabled }),
            }),
            {
                name: 'app-settings-storage',
                storage: createJSONStorage(() => mmkvStateStorage),
            },
        ),
    ),
);

export const useReducedHapticsSetting: () => [
    boolean,
    (reducedHaptics: boolean) => void,
] = () => {
    const reducedHaptics = useAppSettingsStore((state) => state.reducedHaptics);

    const setReducedHaptics = useAppSettingsStore(
        (state) => state.setReducedHaptics,
    );

    return [reducedHaptics, setReducedHaptics];
};

export const useSendMetricsSetting: () => [
    boolean,
    (sendMetrics: boolean) => void,
] = () => {
    const sendMetrics = useAppSettingsStore((state) => state.sendMetrics);

    const setSendMetrics = useAppSettingsStore((state) => state.setSendMetrics);

    return [sendMetrics, setSendMetrics];
};

export const useHideRunTimesSetting: () => [
    boolean,
    (hideRunTimes: boolean) => void,
] = () =>
    useAppSettingsStore(
        useShallow((state) => [state.hideRunTimes, state.setHideRunTimes]),
    );

export const usePushNotificationsSetting: () => [boolean, (v: boolean) => void] =
    () => {
        const enabled = useAppSettingsStore(
            (state) => state.pushNotificationsEnabled,
        );
        const setEnabled = useAppSettingsStore(
            (state) => state.setPushNotificationsEnabled,
        );
        return [enabled, setEnabled];
    };

export const useInAppNotificationsSetting: () => [
    boolean,
    (v: boolean) => void,
] = () => {
    const enabled = useAppSettingsStore(
        (state) => state.inAppNotificationsEnabled,
    );
    const setEnabled = useAppSettingsStore(
        (state) => state.setInAppNotificationsEnabled,
    );
    return [enabled, setEnabled];
};

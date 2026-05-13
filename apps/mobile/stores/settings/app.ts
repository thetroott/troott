import { mmkvStateStorage } from '@/api/storage/mmkv-client';
import { create, createJSONStorage, devtools, persist, useShallow } from '@/lib/zstore';

type AppSettingsStore = {
    sendMetrics: boolean;
    setSendMetrics: (sendMetrics: boolean) => void;

    hideRunTimes: boolean;
    setHideRunTimes: (hideRunTimes: boolean) => void;

    reducedHaptics: boolean;
    setReducedHaptics: (reducedHaptics: boolean) => void;
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

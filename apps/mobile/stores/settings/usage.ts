import { create, createJSONStorage, devtools, persist } from '@/lib/zstore';
import { Platform } from 'react-native';
import { StreamingQuality } from '@/utils/enums.util';
import { mmkvStateStorage } from '@/api/storage/mmkv-client';

export type DownloadQuality = StreamingQuality;

type UsageSettingsStore = {
    downloadQuality: DownloadQuality;
    setDownloadQuality: (downloadQuality: DownloadQuality) => void;

    autoDownload: boolean;
    setAutoDownload: (autoDownload: boolean) => void;
};

export const useUsageSettingsStore = create<UsageSettingsStore>()(
    devtools(
        persist(
            (set) => ({
                downloadQuality: StreamingQuality.Original,
                setDownloadQuality: (downloadQuality: DownloadQuality) =>
                    set({ downloadQuality }),

                autoDownload:
                    Platform.OS === 'android' || Platform.OS === 'ios',
                setAutoDownload: (autoDownload) => set({ autoDownload }),
            }),
            {
                name: 'usage-settings-storage',
                storage: createJSONStorage(() => mmkvStateStorage),
            },
        ),
    ),
);

export const useAutoDownload: () => [
    boolean,
    (autoDownload: boolean) => void,
] = () => {
    const autoDownload = useUsageSettingsStore((state) => state.autoDownload);

    const setAutoDownload = useUsageSettingsStore(
        (state) => state.setAutoDownload,
    );

    return [autoDownload, setAutoDownload];
};

export const useDownloadQuality: () => [
    DownloadQuality,
    (downloadQuality: DownloadQuality) => void,
] = () => {
    const downloadQuality = useUsageSettingsStore(
        (state) => state.downloadQuality,
    );

    const setDownloadQuality = useUsageSettingsStore(
        (state) => state.setDownloadQuality,
    );

    return [downloadQuality, setDownloadQuality];
};

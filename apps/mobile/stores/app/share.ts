import { create } from '@/lib/zstore';

import type { ShareTrack } from '@/components/features/share/share-types';
import type { SharingFlowStep } from '@/components/features/share/listener-sharing-flow';

type ShareFlowState = {
    visible: boolean;
    step: SharingFlowStep;
    track: ShareTrack;
    open: (track?: Partial<ShareTrack>, step?: SharingFlowStep) => void;
    close: () => void;
    setStep: (step: SharingFlowStep) => void;
};

const DEFAULT_TRACK: ShareTrack = {
    id: null,
    title: 'Beauty For Ashes',
    minister: 'Apostle Joshua Selman',
    image: null,
    artwork: null,
};

export const useShareFlow = create<ShareFlowState>((set) => ({
    visible: false,
    step: 'listener-sheet',
    track: DEFAULT_TRACK,
    open: (track, step = 'listener-sheet') =>
        set((state) => ({
            visible: true,
            step,
            track: {
                ...state.track,
                ...track,
            },
        })),
    close: () => set({ visible: false, step: 'listener-sheet' }),
    setStep: (step) => set({ step }),
}));

export function openShareFlow(
    track?: Partial<ShareTrack>,
    step: SharingFlowStep = 'listener-sheet',
) {
    useShareFlow.getState().open(track, step);
}

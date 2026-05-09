import { sidebarSeed, toastSeed } from '../../helpers/seed';
import type { UiDomainState } from './ui.types';

export const uiInitial: UiDomainState = {
    toast: toastSeed,
    sidebar: sidebarSeed,
    loading: false,
};

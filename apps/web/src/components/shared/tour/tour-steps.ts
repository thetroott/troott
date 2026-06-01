import { studioHomePath } from '@/routes/paths';
import {
    getStoredStudioCode,
    normalizeStudioCode,
} from '@/utils/studio-nav.util';

export type TourStepId =
    | 'upload-from-computer'
    | 'sidebar-dashboard'
    | 'sidebar-sermons'
    | 'sidebar-analytics'
    | 'your-feed';

export type TourStepPlacement = 'top' | 'right' | 'bottom';

export interface TourStepConfig {
    id: TourStepId;
    target: string;
    title: string;
    body: string;
    placement: TourStepPlacement;
    showPrevious: boolean;
    primaryLabel: 'Next' | 'Finish';
}

export const TOUR_STEP_COUNT = 5;

export const TOUR_STEPS: TourStepConfig[] = [
    {
        id: 'upload-from-computer',
        target: '[data-tour="upload-from-computer"]',
        title: 'Upload, manage and share',
        body: 'Upload your message, organize the details, and send it in for review all from one place. Everything you need to manage your content and share it on Troott starts here.',
        placement: 'bottom',
        showPrevious: false,
        primaryLabel: 'Next',
    },
    {
        id: 'sidebar-dashboard',
        target: '[data-tour="nav-dashboard"]',
        title: 'Create new clip',
        body: 'Start something impactful. Upload your message, add details, and prepare for review. Your voice meets structure to deliver truth with clarity across the Troott platform.',
        placement: 'right',
        showPrevious: true,
        primaryLabel: 'Next',
    },
    {
        id: 'sidebar-sermons',
        target: '[data-tour="nav-sermons"]',
        title: 'My clips',
        body: 'Manage and organize your teachings, clips. Upload content from your device, track pending reviews, and keep everything in one place as you build your impact library.',
        placement: 'right',
        showPrevious: true,
        primaryLabel: 'Next',
    },
    {
        id: 'sidebar-analytics',
        target: '[data-tour="nav-analytics"]',
        title: 'Performance Stats',
        body: "Track how your messages are doing across the platform. From views and reach to engagement and shares this section gives you a clear view of your content's impact over time.",
        placement: 'right',
        showPrevious: true,
        primaryLabel: 'Next',
    },
    {
        id: 'your-feed',
        target: '[data-tour="your-feeds"]',
        title: 'Feed',
        body: "This is where you'll see updates on your teachings like reviews, approvals, feedback, and more. Think of it as your content heartbeat, helping you stay aligned and inspired.",
        placement: 'top',
        showPrevious: true,
        primaryLabel: 'Finish',
    },
];

export const SIDEBAR_TOUR_ATTR: Record<string, string> = {
    Dashboard: 'nav-dashboard',
    Sermons: 'nav-sermons',
    Analytics: 'nav-analytics',
};

export const TOUR_SESSION_KEYS = {
    pending: 'troott.tour.pending',
    dismissed: 'troott.tour.dismissed',
} as const;

export function markTourLaunchPending(): void {
    if (typeof sessionStorage === 'undefined') {
        return;
    }
    sessionStorage.setItem(TOUR_SESSION_KEYS.pending, '1');
}

export function isTourLaunchPending(searchTourParam?: string | null): boolean {
    if (searchTourParam === '1') {
        return true;
    }
    if (typeof sessionStorage === 'undefined') {
        return false;
    }
    return sessionStorage.getItem(TOUR_SESSION_KEYS.pending) === '1';
}

/** Studio home URL with tour auto-start (`?tour=1`). Returns null when no studio code. */
export function resolveStudioTourLaunchPath(studioCode?: string | null): string | null {
    const code = studioCode?.trim()
        ? normalizeStudioCode(studioCode)
        : getStoredStudioCode();
    if (!code) {
        return null;
    }
    markTourLaunchPending();
    return `${studioHomePath(code)}?tour=1`;
}

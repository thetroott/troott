import { sizes } from '@/constants/sizes';

/**
 * Height reserved for the custom tab row (`tabbar.tsx`: icons + labels + padding).
 * Keep aligned with `mini-player.tsx` positioning.
 */
export const TAB_BAR_CONTENT_HEIGHT = 72;

/** Space between the mini player and the tab bar so they do not feel glued together */
export const MINI_PLAYER_TAB_GAP = sizes.spacing.md;

/**
 * Distance from the screen bottom to the mini player’s bottom edge when main tabs are visible
 * (tab bar height + gap). Add safe-area inset in the player component.
 */
export const MINI_PLAYER_BOTTOM_OFFSET_BASE =
    TAB_BAR_CONTENT_HEIGHT + MINI_PLAYER_TAB_GAP;

/**
 * Legacy name — same as `MINI_PLAYER_BOTTOM_OFFSET_BASE` (toast helpers sit above the mini block).
 */
export const MINI_PLAYER_TAB_BAR_OFFSET = MINI_PLAYER_BOTTOM_OFFSET_BASE;

const BAR_MIN_HEIGHT = 54;
const PROGRESS_HEIGHT = 2;

/** How far the bottom edge of a toast can sit from the screen bottom, sitting just above the mini. */
export function getToastBottomAboveMiniPlayer(
    insetsBottom: number,
    { isMainTabs = true, gap = 8 }: { isMainTabs?: boolean; gap?: number } = {},
): number {
    const base =
        (isMainTabs ? MINI_PLAYER_TAB_BAR_OFFSET : 0) + insetsBottom;
    const miniBlockHeight = BAR_MIN_HEIGHT + PROGRESS_HEIGHT + sizes.spacing.sm * 2;
    return base + miniBlockHeight + gap;
}

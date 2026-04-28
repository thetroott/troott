import { sizes } from '@/constants/sizes';

/**
 * Aligned with `mini-player.tsx` (`TAB_BAR_CONTENT`, `BAR_MIN_HEIGHT`, `PROGRESS_HEIGHT`).
 * The mini shell sits at `bottom: TAB + safeArea`; this returns how far the **top** of that
 * block is from the physical bottom, plus a gap — use as `bottom` for a view **above** the block.
 */
export const MINI_PLAYER_TAB_BAR_OFFSET = 72;

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

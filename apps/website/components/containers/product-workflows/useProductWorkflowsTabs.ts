'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';

import type {
    ProductWorkflowsContent,
    WhyTroottTabId,
} from '@/_data/troott/why-troott';
import { productWorkflowsContent } from '@/_data/troott/why-troott';

export const PRODUCT_WORKFLOWS_TAB_DURATION_MS = 6000;

export function useProductWorkflowsTabs(
    content: ProductWorkflowsContent = productWorkflowsContent,
) {
    const [activeTabId, setActiveTabIdState] = useState<WhyTroottTabId>(
        content.defaultTabId,
    );
    const [cycleKey, setCycleKey] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    const startedAtRef = useRef(0);
    const remainingMsRef = useRef(PRODUCT_WORKFLOWS_TAB_DURATION_MS);
    const timerRef = useRef<number | null>(null);
    const isPausedRef = useRef(false);

    const tabIds = content.tabs.map((tab) => tab.id);
    const animateProgress = !prefersReducedMotion;

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const sync = () => setPrefersReducedMotion(media.matches);
        sync();
        media.addEventListener('change', sync);
        return () => media.removeEventListener('change', sync);
    }, []);

    useEffect(() => {
        remainingMsRef.current = PRODUCT_WORKFLOWS_TAB_DURATION_MS;
    }, [activeTabId, cycleKey]);

    const clearTimer = useCallback(() => {
        if (timerRef.current === null) return;

        window.clearTimeout(timerRef.current);
        timerRef.current = null;

        const elapsed = Date.now() - startedAtRef.current;
        remainingMsRef.current = Math.max(
            0,
            remainingMsRef.current - elapsed,
        );
    }, []);

    const advanceTab = useCallback(() => {
        if (isPausedRef.current) return;

        remainingMsRef.current = PRODUCT_WORKFLOWS_TAB_DURATION_MS;
        setActiveTabIdState((current) => {
            const index = tabIds.indexOf(current);
            const nextIndex = (index + 1) % tabIds.length;
            return tabIds[nextIndex]!;
        });
        setCycleKey((key) => key + 1);
    }, [tabIds]);

    const selectTab = useCallback(
        (id: WhyTroottTabId) => {
            isPausedRef.current = false;
            setIsPaused(false);
            remainingMsRef.current = PRODUCT_WORKFLOWS_TAB_DURATION_MS;
            clearTimer();
            setActiveTabIdState(id);
            setCycleKey((key) => key + 1);
        },
        [clearTimer],
    );

    const scheduleTimer = useCallback(() => {
        clearTimer();
        if (isPausedRef.current) return;

        startedAtRef.current = Date.now();
        timerRef.current = window.setTimeout(() => {
            timerRef.current = null;
            advanceTab();
        }, remainingMsRef.current);
    }, [advanceTab, clearTimer]);

    useEffect(() => {
        scheduleTimer();
        return clearTimer;
    }, [activeTabId, cycleKey, isPaused, scheduleTimer, clearTimer]);

    const pause = useCallback(() => {
        if (isPausedRef.current) return;

        isPausedRef.current = true;
        clearTimer();
        setIsPaused(true);
    }, [clearTimer]);

    const resume = useCallback(() => {
        if (!isPausedRef.current) return;

        isPausedRef.current = false;
        setIsPaused(false);
    }, []);

    const onTabKeyDown = useCallback(
        (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
            const { key } = event;

            if (
                key !== 'ArrowDown' &&
                key !== 'ArrowUp' &&
                key !== 'Home' &&
                key !== 'End'
            ) {
                return;
            }

            event.preventDefault();

            if (key === 'Home') {
                selectTab(tabIds[0]!);
                return;
            }

            if (key === 'End') {
                selectTab(tabIds[tabIds.length - 1]!);
                return;
            }

            const direction = key === 'ArrowDown' ? 1 : -1;
            const nextIndex =
                (index + direction + tabIds.length) % tabIds.length;
            selectTab(tabIds[nextIndex]!);
        },
        [selectTab, tabIds],
    );

    return {
        activeTabId,
        selectTab,
        onTabKeyDown,
        cycleKey,
        isPaused,
        pause,
        resume,
        tabAutoDurationMs: PRODUCT_WORKFLOWS_TAB_DURATION_MS,
        animateProgress,
    };
}

export type ProductWorkflowsTabProgressStyle = CSSProperties & {
    '--tab-duration'?: string;
    '--ring-circumference'?: string;
};

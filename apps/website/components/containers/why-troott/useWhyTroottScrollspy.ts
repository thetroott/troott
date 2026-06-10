'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { WhyTroottContent, WhyTroottTabId } from '@/_data/troott/why-troott';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export function sectionDomId(tabId: WhyTroottTabId): string {
    return `why-troott-${tabId}`;
}

export function getSiteHeaderScrollOffsetPx(): number {
    if (typeof document === 'undefined') return 88;

    const root = document.documentElement;
    const headerRaw =
        getComputedStyle(root).getPropertyValue('--site-header-height').trim() ||
        '4rem';

    const probe = document.createElement('div');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    probe.style.height = headerRaw;
    document.body.appendChild(probe);
    const headerPx = probe.offsetHeight;
    document.body.removeChild(probe);

    const rootFontSize = parseFloat(getComputedStyle(root).fontSize) || 16;
    return headerPx + 1.5 * rootFontSize;
}

/** Where a section "counts" as active — below sticky nav, in the reading band. */
function getActivationLinePx(): number {
    const headerOffset = getSiteHeaderScrollOffsetPx();
    const readingBand = Math.min(window.innerHeight * 0.2, 160);
    return headerOffset + readingBand;
}

function resolveActiveSectionId(
    sections: HTMLElement[],
    container: HTMLElement,
): WhyTroottTabId | null {
    if (sections.length === 0) return null;

    const headerOffset = getSiteHeaderScrollOffsetPx();
    const activationLine = getActivationLinePx();
    const viewportHeight = window.innerHeight;
    const containerRect = container.getBoundingClientRect();

    if (containerRect.bottom <= headerOffset) {
        return (
            sections[sections.length - 1]?.getAttribute(
                'data-section-id',
            ) as WhyTroottTabId | null
        );
    }

    if (containerRect.top >= viewportHeight) {
        return null;
    }

    for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= activationLine && rect.bottom > activationLine) {
            return section.getAttribute('data-section-id') as WhyTroottTabId;
        }
    }

    let bestSection: HTMLElement | null = null;
    let bestVisible = -1;

    for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.bottom <= headerOffset || rect.top >= viewportHeight) continue;

        const visibleTop = Math.max(rect.top, headerOffset);
        const visibleBottom = Math.min(rect.bottom, viewportHeight);
        const visible = Math.max(0, visibleBottom - visibleTop);

        if (visible > bestVisible) {
            bestVisible = visible;
            bestSection = section;
        }
    }

    if (bestSection) {
        return bestSection.getAttribute('data-section-id') as WhyTroottTabId;
    }

    const firstTop = sections[0]!.getBoundingClientRect().top;
    if (firstTop > activationLine) {
        return sections[0]!.getAttribute('data-section-id') as WhyTroottTabId;
    }

    return (
        sections[sections.length - 1]?.getAttribute(
            'data-section-id',
        ) as WhyTroottTabId | null
    );
}

export function useWhyTroottScrollspy(content: WhyTroottContent) {
    const { tabs, defaultTabId } = content;
    const [activeTabId, setActiveTabId] = useState<WhyTroottTabId>(defaultTabId);
    const sectionsRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);
    const isLg = useMediaQuery('(min-width: 1024px)');
    const prefersReducedMotion = usePrefersReducedMotion();

    const syncActiveSection = useCallback(() => {
        if (isScrollingRef.current || !sectionsRef.current) return;

        const sections = Array.from(
            sectionsRef.current.querySelectorAll<HTMLElement>('[data-section-id]'),
        );
        const nextId = resolveActiveSectionId(sections, sectionsRef.current);

        if (nextId) {
            setActiveTabId(nextId);
        }
    }, []);

    useEffect(() => {
        if (!isLg || !sectionsRef.current) return;

        syncActiveSection();
        window.addEventListener('scroll', syncActiveSection, { passive: true });
        window.addEventListener('resize', syncActiveSection);

        return () => {
            window.removeEventListener('scroll', syncActiveSection);
            window.removeEventListener('resize', syncActiveSection);
        };
    }, [isLg, syncActiveSection, tabs.length]);

    const scrollToSection = useCallback(
        (tabId: WhyTroottTabId) => {
            const el = document.getElementById(sectionDomId(tabId));
            if (!el) return;

            setActiveTabId(tabId);
            isScrollingRef.current = true;

            const top =
                el.getBoundingClientRect().top +
                window.scrollY -
                getSiteHeaderScrollOffsetPx();

            window.scrollTo({
                top,
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
            });

            window.setTimeout(() => {
                isScrollingRef.current = false;
                syncActiveSection();
            }, 600);
        },
        [prefersReducedMotion, syncActiveSection],
    );

    return {
        activeTabId,
        scrollToSection,
        sectionsRef,
    };
}

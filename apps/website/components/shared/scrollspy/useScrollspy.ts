'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

import {
    getActivationLinePx,
    getSiteHeaderScrollOffsetPx,
} from './scrollspy-dom';

function resolveActiveSectionId<T extends string>(
    sections: HTMLElement[],
    container: HTMLElement,
): T | null {
    if (sections.length === 0) return null;

    const headerOffset = getSiteHeaderScrollOffsetPx();
    const activationLine = getActivationLinePx();
    const viewportHeight = window.innerHeight;
    const containerRect = container.getBoundingClientRect();

    if (containerRect.bottom <= headerOffset) {
        return (
            sections[sections.length - 1]?.getAttribute(
                'data-section-id',
            ) as T | null
        );
    }

    if (containerRect.top >= viewportHeight) {
        return null;
    }

    for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= activationLine && rect.bottom > activationLine) {
            return section.getAttribute('data-section-id') as T;
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
        return bestSection.getAttribute('data-section-id') as T;
    }

    const firstTop = sections[0]!.getBoundingClientRect().top;
    if (firstTop > activationLine) {
        return sections[0]!.getAttribute('data-section-id') as T;
    }

    return (
        sections[sections.length - 1]?.getAttribute(
            'data-section-id',
        ) as T | null
    );
}

export function useScrollspy<T extends string>({
    defaultSectionId,
    sectionIds,
    domIdForSection,
}: {
    defaultSectionId: T;
    sectionIds: readonly T[];
    domIdForSection: (id: T) => string;
}) {
    const [activeSectionId, setActiveSectionId] =
        useState<T>(defaultSectionId);
    const sectionsRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);
    const isLg = useMediaQuery('(min-width: 1024px)');
    const prefersReducedMotion = usePrefersReducedMotion();

    const syncActiveSection = useCallback(() => {
        if (isScrollingRef.current || !sectionsRef.current) return;

        const sections = Array.from(
            sectionsRef.current.querySelectorAll<HTMLElement>(
                '[data-section-id]',
            ),
        );
        const nextId = resolveActiveSectionId<T>(
            sections,
            sectionsRef.current,
        );

        if (nextId) {
            setActiveSectionId(nextId);
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
    }, [isLg, syncActiveSection, sectionIds.length]);

    const scrollToSection = useCallback(
        (sectionId: T) => {
            const el = document.getElementById(domIdForSection(sectionId));
            if (!el) return;

            setActiveSectionId(sectionId);
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
        [domIdForSection, prefersReducedMotion, syncActiveSection],
    );

    return {
        activeSectionId,
        scrollToSection,
        sectionsRef,
    };
}

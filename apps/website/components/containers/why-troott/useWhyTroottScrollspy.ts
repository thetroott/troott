'use client';

import type { WhyTroottContent, WhyTroottTabId } from '@/_data/troott/why-troott';
import {
    getSiteHeaderScrollOffsetPx,
    sectionDomId as scrollspySectionDomId,
    useScrollspy,
} from '@/components/shared/scrollspy';

const WHY_TROOTT_PREFIX = 'why-troott';

export function sectionDomId(tabId: WhyTroottTabId): string {
    return scrollspySectionDomId(WHY_TROOTT_PREFIX, tabId);
}

export { getSiteHeaderScrollOffsetPx };

export function useWhyTroottScrollspy(content: WhyTroottContent) {
    const { tabs, defaultTabId } = content;
    const sectionIds = tabs.map((tab) => tab.id);

    const { activeSectionId, scrollToSection, sectionsRef } =
        useScrollspy<WhyTroottTabId>({
            defaultSectionId: defaultTabId,
            sectionIds,
            domIdForSection: sectionDomId,
        });

    return {
        activeTabId: activeSectionId,
        scrollToSection,
        sectionsRef,
    };
}

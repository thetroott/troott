'use client';

import { useCallback, useState } from 'react';
import type { KeyboardEvent } from 'react';

import type { WhyTroottContent, WhyTroottTabId } from '@/_data/troott/why-troott';
import { whyTroottContent } from '@/_data/troott/why-troott';

export function useWhyTroottTabs(content: WhyTroottContent = whyTroottContent) {
    const [activeTabId, setActiveTabId] = useState<WhyTroottTabId>(
        content.defaultTabId,
    );

    const tabIds = content.tabs.map((tab) => tab.id);

    const onTabKeyDown = useCallback(
        (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

            event.preventDefault();
            const direction = event.key === 'ArrowRight' ? 1 : -1;
            const nextIndex =
                (index + direction + tabIds.length) % tabIds.length;
            setActiveTabId(tabIds[nextIndex]!);
        },
        [tabIds],
    );

    return { activeTabId, setActiveTabId, onTabKeyDown };
}

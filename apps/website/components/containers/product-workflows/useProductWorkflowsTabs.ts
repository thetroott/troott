'use client';

import { useCallback, useState } from 'react';
import type { KeyboardEvent } from 'react';

import type { WhyTroottTabId } from '@/_data/troott/why-troott';
import { productWorkflowsContent } from '@/_data/troott/why-troott';

export function useProductWorkflowsTabs(
    defaultTabId: WhyTroottTabId = productWorkflowsContent.defaultTabId,
) {
    const [activeTabId, setActiveTabId] = useState<WhyTroottTabId>(defaultTabId);

    const tabIds = productWorkflowsContent.tabs.map((tab) => tab.id);

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
                setActiveTabId(tabIds[0]!);
                return;
            }

            if (key === 'End') {
                setActiveTabId(tabIds[tabIds.length - 1]!);
                return;
            }

            const direction = key === 'ArrowDown' ? 1 : -1;
            const nextIndex =
                (index + direction + tabIds.length) % tabIds.length;
            setActiveTabId(tabIds[nextIndex]!);
        },
        [tabIds],
    );

    return { activeTabId, setActiveTabId, onTabKeyDown };
}

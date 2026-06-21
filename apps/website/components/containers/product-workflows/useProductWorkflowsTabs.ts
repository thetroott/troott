'use client';

import { useCallback, useState } from 'react';
import type { KeyboardEvent } from 'react';

import type {
    ProductWorkflowsContent,
    WhyTroottTabId,
} from '@/_data/troott/why-troott';
import { productWorkflowsContent } from '@/_data/troott/why-troott';

export function useProductWorkflowsTabs(
    content: ProductWorkflowsContent = productWorkflowsContent,
) {
    const [activeTabId, setActiveTabId] = useState<WhyTroottTabId>(
        content.defaultTabId,
    );

    const tabIds = content.tabs.map((tab) => tab.id);

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

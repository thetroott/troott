import React from 'react';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

/**
 * Typed prefix (muted) + completion (white) — Figma Search active / recent suggestions (5176:22776).
 */
export default function RecentSuggestionLabel({
    text,
    prefix,
}: {
    text: string;
    prefix: string;
}) {
    const p = prefix.trim();
    const lowT = text.toLowerCase();
    const lowP = p.toLowerCase();
    if (!p || !lowT.startsWith(lowP)) {
        return (
            <Text size="xs" color={theme.colors.white[50]} weight="regular">
                {text}
            </Text>
        );
    }
    const typed = text.slice(0, lowP.length);
    const completion = text.slice(lowP.length);
    return (
        <Text size="xs" weight="regular">
            <Text color={theme.colors.grey[400]}>{typed}</Text>
            <Text color={theme.colors.white[50]} weight="semiBold">
                {completion}
            </Text>
        </Text>
    );
}

'use client';

import { useEffect, useState } from 'react';

import { detectPlatform, type Platform } from '@/lib/detect-platform';

export function usePlatform(): Platform {
    const [platform, setPlatform] = useState<Platform>('unknown');

    useEffect(() => {
        setPlatform(
            detectPlatform(
                navigator.userAgent,
                navigator.maxTouchPoints ?? 0,
            ),
        );
    }, []);

    return platform;
}

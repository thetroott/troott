'use client';

import { track } from '@vercel/analytics';

import type { DownloadPlatformId } from '@/components/containers/downloads/types';
import { isGetTroottEnabled } from '@/lib/get-troott-download';
import { cx } from '@/lib/utils';

type DownloadPlatformTileProps = {
    title: string;
    subtitle: string;
    href: string;
    platformId: DownloadPlatformId;
    onFallback: () => void;
    centered?: boolean;
    compact?: boolean;
};

export function DownloadPlatformTile({
    title,
    subtitle,
    href,
    platformId,
    onFallback,
    centered = false,
    compact = false,
}: DownloadPlatformTileProps) {
    const enabled = isGetTroottEnabled();
    const className = cx(
        'flex w-full min-w-0 flex-col rounded-sm bg-[#FDFCF0] text-black',
        compact ? 'px-4 py-4' : 'px-6 py-5',
        centered ? 'items-center text-center' : 'items-start text-left',
        'transition hover:bg-[#f5f4e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white',
    );

    const subtitleClass = cx(
        'text-zinc-600',
        compact ? 'text-xs leading-snug' : 'text-sm',
    );

    if (!enabled) {
        return (
            <button
                type="button"
                className={className}
                aria-label={`Get Troott on ${title}`}
                onClick={() => {
                    track('listenerSignup', { source: 'downloads_section' });
                    onFallback();
                }}
            >
                <span className="font-normal">{title}</span>
                <span className={subtitleClass}>{subtitle}</span>
            </button>
        );
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            aria-label={`Get Troott on ${title}`}
            onClick={() => track('download_tile_click', { platform: platformId })}
        >
            <span className="font-normal">{title}</span>
            <span className={subtitleClass}>{subtitle}</span>
        </a>
    );
}

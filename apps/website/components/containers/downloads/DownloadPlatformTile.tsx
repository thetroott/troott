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
};

export function DownloadPlatformTile({
    title,
    subtitle,
    href,
    platformId,
    onFallback,
}: DownloadPlatformTileProps) {
    const enabled = isGetTroottEnabled();
    const className = cx(
        'flex w-full flex-col items-start rounded-sm bg-[#FDFCF0] px-6 py-5 text-left text-black',
        'transition hover:bg-[#f5f4e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white',
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
                <span className="text-sm text-zinc-600">{subtitle}</span>
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
            <span className="text-sm text-zinc-600">{subtitle}</span>
        </a>
    );
}

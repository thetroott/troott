'use client';

import { RiFileCopyLine } from '@remixicon/react';
import { track } from '@vercel/analytics';
import { toast } from 'sonner';

import type { DownloadPlatformId } from '@/components/containers/downloads/types';
import {
    copyToClipboard,
    formatCopyDisplayUrl,
} from '@/lib/copy-to-clipboard';
import { cx } from '@/lib/utils';

type CopyDownloadLinkProps = {
    url: string;
    platform: DownloadPlatformId;
};

export function CopyDownloadLink({ url, platform }: CopyDownloadLinkProps) {
    async function handleCopy() {
        const ok = await copyToClipboard(url);
        if (ok) {
            track('download_link_copy', { platform });
            toast.success('Link copied');
        } else {
            toast.error('Could not copy link');
        }
    }

    return (
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-4 py-2.5">
            <code className="min-w-0 flex-1 truncate text-xs text-zinc-400 sm:text-sm">
                <span className="hidden sm:inline">{url}</span>
                <span className="sm:hidden">{formatCopyDisplayUrl(url)}</span>
            </code>
            <button
                type="button"
                onClick={handleCopy}
                aria-label={`Copy download link for ${platform}`}
                className={cx(
                    'shrink-0 rounded-sm p-1 text-zinc-400 transition-colors',
                    'hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white',
                )}
            >
                <RiFileCopyLine aria-hidden="true" className="size-4" />
            </button>
        </div>
    );
}

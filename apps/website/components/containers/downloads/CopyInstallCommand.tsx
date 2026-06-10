'use client';

import { RiFileCopyLine } from '@remixicon/react';
import { track } from '@vercel/analytics';
import { toast } from 'sonner';

import { copyToClipboard } from '@/lib/copy-to-clipboard';
import { cx } from '@/lib/utils';

type CopyInstallCommandProps = {
    command: string;
    platform: 'macos' | 'windows';
};

export function CopyInstallCommand({ command, platform }: CopyInstallCommandProps) {
    async function handleCopy() {
        const ok = await copyToClipboard(command);
        if (ok) {
            track('download_install_command_copy', { platform });
            toast.success('Command copied');
        } else {
            toast.error('Could not copy command');
        }
    }

    return (
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-stone-900 px-4 py-2.5">
            <code className="min-w-0 flex-1 truncate text-left text-xs text-zinc-400 sm:text-sm">
                <span className="text-zinc-500">$ </span>
                {command}
            </code>
            <button
                type="button"
                onClick={handleCopy}
                aria-label={`Copy install command for ${platform}`}
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

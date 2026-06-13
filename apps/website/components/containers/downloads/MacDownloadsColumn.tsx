'use client';

import { RiAppleFill } from '@remixicon/react';

import type { DesktopDownloadPlatform } from '@/_data/troott/downloads';
import { getTroottDownloadUrlByPackage } from '@/lib/build-get-troott-url';

import { CopyInstallCommand } from './CopyInstallCommand';
import { DownloadPlatformTile } from './DownloadPlatformTile';

type MacDownloadsColumnProps = {
    mac: DesktopDownloadPlatform['mac'];
    onOpenListener: () => void;
};

export function MacDownloadsColumn({
    mac,
    onOpenListener,
}: MacDownloadsColumnProps) {
    const macUrl = getTroottDownloadUrlByPackage(mac.tile.package);

    return (
        <div className="flex w-full min-w-0 flex-col items-center text-center">
            <RiAppleFill
                aria-hidden="true"
                className="mb-3 size-8 text-white"
            />
            <h3 className="mb-4 text-lg font-medium text-white">{mac.title}</h3>
            <DownloadPlatformTile
                title={mac.tile.title}
                subtitle={mac.tile.subtitle}
                href={macUrl}
                platformId="desktop"
                onFallback={onOpenListener}
                centered
            />
            <div className="mt-4 w-full">
                <CopyInstallCommand
                    command={mac.installCommand}
                    platform="macos"
                />
            </div>
        </div>
    );
}

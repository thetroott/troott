'use client';

import { RiWindowsFill } from '@remixicon/react';

import type { DesktopDownloadPlatform } from '@/_data/troott/downloads';
import { getTroottDownloadUrlByPackage } from '@/lib/build-get-troott-url';

import { CopyInstallCommand } from './CopyInstallCommand';
import { DownloadPlatformTile } from './DownloadPlatformTile';

type WindowsDownloadsColumnProps = {
    windows: DesktopDownloadPlatform['windows'];
    onOpenListener: () => void;
};

export function WindowsDownloadsColumn({
    windows,
    onOpenListener,
}: WindowsDownloadsColumnProps) {
    const [windowsX64, windowsArm64] = windows.tiles;
    const windowsX64Url = getTroottDownloadUrlByPackage(windowsX64.package);
    const windowsArm64Url = getTroottDownloadUrlByPackage(windowsArm64.package);

    return (
        <div className="flex w-full min-w-0 flex-col items-center text-center">
            <RiWindowsFill
                aria-hidden="true"
                className="mb-3 size-8 text-white"
            />
            <h3 className="mb-4 text-lg font-medium text-white">
                {windows.title}
            </h3>
            <div className="flex w-full min-w-0 flex-col gap-3">
                <DownloadPlatformTile
                    title={windowsX64.title}
                    subtitle={windowsX64.subtitle}
                    href={windowsX64Url}
                    platformId="desktop"
                    onFallback={onOpenListener}
                    centered
                    compact
                />
                <DownloadPlatformTile
                    title={windowsArm64.title}
                    subtitle={windowsArm64.subtitle}
                    href={windowsArm64Url}
                    platformId="desktop"
                    onFallback={onOpenListener}
                    centered
                    compact
                />
            </div>
            <div className="mt-4 w-full">
                <CopyInstallCommand
                    command={windows.installCommand}
                    platform="windows"
                />
            </div>
            <div className="mt-4 flex w-full items-center justify-between gap-3">
                <span className="text-sm font-medium text-white">.exe</span>
                <div className="flex gap-2">
                    {windows.archOptions.map((arch) => (
                        <a
                            key={arch.id}
                            href={
                                arch.id === 'x64'
                                    ? windowsX64Url
                                    : windowsArm64Url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md border border-white/10 bg-stone-900 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                        >
                            {arch.label}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

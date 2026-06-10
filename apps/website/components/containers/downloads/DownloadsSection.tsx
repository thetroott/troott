'use client';

import Link from 'next/link';
import {
    RiAppleFill,
    RiGlobalLine,
    RiGooglePlayFill,
} from '@remixicon/react';
import { track } from '@vercel/analytics';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import {
    downloadsContent,
    isDesktopPlatform,
    type StandardDownloadPlatform,
} from '@/_data/troott/downloads';
import Newsletter from '@/components/NewsletterModal';
import { getTroottDownloadUrlByPackage } from '@/lib/build-get-troott-url';

import { CopyDownloadLink } from './CopyDownloadLink';
import { DownloadPlatformTile } from './DownloadPlatformTile';
import { MacDownloadsColumn } from './MacDownloadsColumn';
import { WindowsDownloadsColumn } from './WindowsDownloadsColumn';

const platformIcons = {
    ios: RiAppleFill,
    android: RiGooglePlayFill,
    web: RiGlobalLine,
} as const;

function DownloadPlatformCell({
    children,
    className,
    'aria-hidden': ariaHidden,
}: {
    children?: ReactNode;
    className?: string;
    'aria-hidden'?: boolean;
}) {
    return (
        <div
            className={['min-w-0 py-8 md:px-6 lg:px-10 lg:py-0', className]
                .filter(Boolean)
                .join(' ')}
            aria-hidden={ariaHidden}
        >
            {children}
        </div>
    );
}

function StandardDownloadPlatformColumn({
    platform,
    onOpenListener,
}: {
    platform: StandardDownloadPlatform;
    onOpenListener: () => void;
}) {
    const Icon = platformIcons[platform.id];
    const url = getTroottDownloadUrlByPackage(platform.primary.package);

    return (
        <div className="flex flex-col items-center text-center">
            <Icon aria-hidden="true" className="mx-auto mb-3 size-8 text-white" />
            <h3 className="mb-4 text-lg font-medium text-white">
                {platform.title}
            </h3>
            <DownloadPlatformTile
                title={platform.primary.title}
                subtitle={platform.primary.subtitle}
                href={url}
                platformId={platform.id}
                onFallback={onOpenListener}
            />
            <div className="mt-4 w-full">
                <CopyDownloadLink url={url} platform={platform.id} />
            </div>
        </div>
    );
}

export function DownloadsSection() {
    const pathname = usePathname();
    const [dialogOpen, setDialogOpen] = useState(false);

    if (pathname?.startsWith('/legal')) {
        return null;
    }

    const openListenerModal = () => {
        track('listenerSignup', { source: 'downloads_section' });
        setDialogOpen(true);
    };

    const standardPlatforms = downloadsContent.platforms.filter(
        (platform): platform is StandardDownloadPlatform =>
            !isDesktopPlatform(platform),
    );
    const desktopPlatform = downloadsContent.platforms.find(isDesktopPlatform);

    const [ios, android, web] = standardPlatforms;

    return (
        <>
            <section
                id="downloads"
                aria-labelledby="downloads-heading"
                className="w-full bg-stone-950 py-20 pb-24 sm:py-28 sm:pb-32"
            >
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="mb-12 sm:mb-16">
                        <p className="font-mono text-[13px] text-zinc-500">
                            {downloadsContent.label}
                        </p>
                        <h2
                            id="downloads-heading"
                            className="mt-5 text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.5rem]"
                        >
                            {downloadsContent.heading}
                        </h2>
                        <p className="mt-4 max-w-2xl text-base text-zinc-400">
                            {downloadsContent.description}{' '}
                            <Link
                                href={downloadsContent.studioLink.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white underline underline-offset-4 hover:text-zinc-300"
                            >
                                {downloadsContent.studioLink.label} →
                            </Link>
                        </p>
                    </div>

                    <div className="divide-y divide-stone-900">
                        <div className="grid divide-y divide-stone-900 md:grid-cols-3 md:divide-y-0 md:divide-x lg:pb-10">
                            {ios ? (
                                <DownloadPlatformCell>
                                    <StandardDownloadPlatformColumn
                                        platform={ios}
                                        onOpenListener={openListenerModal}
                                    />
                                </DownloadPlatformCell>
                            ) : null}
                            {android ? (
                                <DownloadPlatformCell>
                                    <StandardDownloadPlatformColumn
                                        platform={android}
                                        onOpenListener={openListenerModal}
                                    />
                                </DownloadPlatformCell>
                            ) : null}
                            {web ? (
                                <DownloadPlatformCell>
                                    <StandardDownloadPlatformColumn
                                        platform={web}
                                        onOpenListener={openListenerModal}
                                    />
                                </DownloadPlatformCell>
                            ) : null}
                        </div>

                        {desktopPlatform ? (
                            <div className="grid divide-y divide-stone-900 md:grid-cols-3 md:divide-y-0 md:divide-x lg:pt-10">
                                <DownloadPlatformCell>
                                    <MacDownloadsColumn
                                        mac={desktopPlatform.mac}
                                        onOpenListener={openListenerModal}
                                    />
                                </DownloadPlatformCell>
                                <DownloadPlatformCell>
                                    <WindowsDownloadsColumn
                                        windows={desktopPlatform.windows}
                                        onOpenListener={openListenerModal}
                                    />
                                </DownloadPlatformCell>
                                <DownloadPlatformCell
                                    className="hidden md:block"
                                    aria-hidden
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>

            <Newsletter
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                user_type="listener"
            />
        </>
    );
}

'use client';

import Link from 'next/link';
import {
    RiAppleFill,
    RiGooglePlayFill,
    RiGlobalLine,
} from '@remixicon/react';
import { track } from '@vercel/analytics';
import { useState } from 'react';

import { downloadsContent } from '@/_data/troott/downloads';
import Newsletter from '@/components/NewsletterModal';
import { getTroottDownloadUrlByPackage } from '@/lib/build-get-troott-url';

import { CopyDownloadLink } from './CopyDownloadLink';
import { DownloadPlatformTile } from './DownloadPlatformTile';

const platformIcons = {
    ios: RiAppleFill,
    android: RiGooglePlayFill,
    web: RiGlobalLine,
} as const;

function DownloadPlatformColumn({
    platform,
    onOpenListener,
}: {
    platform: (typeof downloadsContent.platforms)[number];
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
    const [dialogOpen, setDialogOpen] = useState(false);

    const openListenerModal = () => {
        track('listenerSignup', { source: 'downloads_section' });
        setDialogOpen(true);
    };

    return (
        <>
            <section
                id="downloads"
                aria-labelledby="downloads-heading"
                className="w-full bg-background py-20 pb-24 sm:py-28 sm:pb-32"
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
                            {downloadsContent.description}
                        </p>
                        <Link
                            href={downloadsContent.studioLink.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-block text-white underline underline-offset-4 hover:text-zinc-300"
                        >
                            {downloadsContent.studioLink.label} →
                        </Link>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                        {downloadsContent.platforms.map((platform) => (
                            <DownloadPlatformColumn
                                key={platform.id}
                                platform={platform}
                                onOpenListener={openListenerModal}
                            />
                        ))}
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

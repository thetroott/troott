import {
    RiHeadphoneLine,
    RiMicLine,
} from '@remixicon/react';
import Link from 'next/link';

import { LegalBreadcrumbs } from './LegalBreadcrumbs';
import { LegalPageHeader } from './LegalPageHeader';

const audiences = [
    {
        title: 'Listener',
        description: 'App, account, and listening experience',
        href: '/legal/listener',
        icon: RiHeadphoneLine,
    },
    {
        title: 'Minister',
        description: 'Studio, uploads, and creator tools',
        href: '/legal/minister',
        icon: RiMicLine,
    },
] as const;

export function LegalAudiencePage() {
    return (
        <section className="relative w-full bg-background py-20 lg:py-28">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="mx-auto max-w-[640px] text-center">
                    <LegalBreadcrumbs />
                    <LegalPageHeader
                        heading="Choose your"
                        headingMuted="legal documents."
                        className="mt-5"
                    />

                    <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                        {audiences.map((audience) => {
                            const Icon = audience.icon;
                            return (
                                <Link
                                    key={audience.href}
                                    href={audience.href}
                                    className="flex min-h-[160px] flex-col rounded-xl border border-white/10 bg-[#111111] p-6 text-left transition-colors hover:border-white/20"
                                >
                                    <span className="flex size-10 items-center justify-center rounded-sm bg-teal-400/20">
                                        <Icon
                                            aria-hidden="true"
                                            className="size-5 text-teal-400"
                                        />
                                    </span>
                                    <span className="mt-4 text-lg font-medium text-white">
                                        {audience.title}
                                    </span>
                                    <span className="mt-2 text-sm leading-relaxed text-zinc-400">
                                        {audience.description}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

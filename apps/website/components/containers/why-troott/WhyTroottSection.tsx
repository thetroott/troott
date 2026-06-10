'use client';

import Image from 'next/image';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import { useState } from 'react';

import { whyTroottContent, type WhyTroottTab } from '@/_data/troott/why-troott';
import Newsletter from '@/components/NewsletterModal';
import { GetTroottButton } from '@/components/ui/get-troott-button';
import { cx } from '@/lib/utils';

import {
    sectionDomId,
    useWhyTroottScrollspy,
} from './useWhyTroottScrollspy';
import { whyTroottIcons } from './why-troott-icons';

function TabPanelContent({
    tab,
    onOpenListener,
    titleId,
}: {
    tab: WhyTroottTab;
    onOpenListener?: () => void;
    titleId?: string;
}) {
    const Icon = whyTroottIcons[tab.icon];

    return (
        <>
            <div className="flex items-center gap-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-sm border">
                    <Icon aria-hidden="true" className="size-4 text-teal-500" />
                </span>
                <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                    {tab.eyebrow}
                </p>
            </div>
            <h3
                id={titleId}
                className="mt-4 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-[1.875rem]"
                aria-live="polite"
            >
                {tab.title}
            </h3>
            <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
                <p className="max-w-[28rem] text-[15px] leading-[1.65] text-zinc-400 sm:text-base sm:leading-[1.7]">
                    {tab.description}
                </p>
                <div className="shrink-0">
                    {tab.cta.useGetTroott ? (
                        <GetTroottButton
                            variant="pill"
                            labelMode="full"
                            onFallback={onOpenListener}
                        />
                    ) : (
                        <Link
                            href={tab.cta.href ?? '#'}
                            target={tab.cta.external ? '_blank' : undefined}
                            rel={
                                tab.cta.external
                                    ? 'noopener noreferrer'
                                    : undefined
                            }
                            className="inline-flex h-10 items-center justify-center rounded-sm bg-white px-6 py-2.5 text-sm font-normal text-black transition-colors hover:bg-white/90"
                        >
                            {tab.cta.label}
                        </Link>
                    )}
                </div>
            </div>
            <div className="relative mt-10 aspect-[16/10] min-h-[320px] w-full overflow-hidden rounded-2xl border border-white/10">
                <Image
                    key={tab.id}
                    src={tab.image.src}
                    alt={tab.image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    priority={tab.id === 'listen'}
                />
            </div>
        </>
    );
}

export function WhyTroottSection() {
    const content = whyTroottContent;
    const [dialogOpen, setDialogOpen] = useState(false);

    const onOpenListener = () => {
        track('listenerSignup', { source: 'why_troott_section' });
        setDialogOpen(true);
    };

    const { activeTabId, scrollToSection, sectionsRef } =
        useWhyTroottScrollspy(content);

    return (
        <>
            <section
                id="why-troott"
                aria-labelledby="why-troott-heading"
                className="relative w-full overflow-visible bg-background py-20 sm:py-28"
            >
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="mb-12 sm:mb-16">
                        <p className="font-mono text-[13px] leading-none text-zinc-500">
                            {content.label}
                        </p>
                        <h2
                            id="why-troott-heading"
                            className="mt-5 text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.5rem]"
                        >
                            <span className="block">{content.heading}</span>
                            <span className="block text-zinc-500">
                                {content.headingMuted}
                            </span>
                        </h2>
                    </div>

                    <div className="lg:grid lg:grid-cols-[minmax(240px,280px)_1fr] lg:gap-12 xl:gap-16">
                        <div className="relative hidden lg:block">
                            <nav
                                aria-label="Why Troott products"
                                className="sticky z-10"
                                style={{
                                    top: 'calc(var(--site-header-height, 4rem) + 1.5rem)',
                                }}
                            >
                                <ul className="flex flex-col">
                                    {content.tabs.map((tab) => {
                                        const Icon = whyTroottIcons[tab.icon];
                                        const isActive = tab.id === activeTabId;
                                        return (
                                            <li
                                                key={tab.id}
                                                className="border-b border-white/10"
                                            >
                                                <a
                                                    href={`#${sectionDomId(tab.id)}`}
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        scrollToSection(tab.id);
                                                    }}
                                                    aria-current={
                                                        isActive
                                                            ? 'true'
                                                            : undefined
                                                    }
                                                    className={cx(
                                                        'group flex w-full items-center gap-3 py-4 pl-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                                                        isActive
                                                            ? ' text-white'
                                                            : 'text-zinc-500 hover:text-zinc-300',
                                                    )}
                                                >
                                                    <span
                                                        className={cx(
                                                            'flex size-8 shrink-0 items-center justify-center rounded-sm bg-neutral-50/10 transition-colors',
                                                            isActive
                                                                ? 'bg-teal-400 '
                                                                : 'group-hover:bg-teal-500',
                                                        )}
                                                    >
                                                        <Icon
                                                            aria-hidden="true"
                                                            className="size-4 text-white-400 group-hover:text-white "
                                                        />
                                                    </span>
                                                    <span className="text-sm font-normal uppercase tracking-wide">
                                                        {tab.navLabel}
                                                    </span>
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                        </div>

                        <div
                            ref={sectionsRef}
                            className="flex min-w-0 flex-col gap-16"
                        >
                            {content.tabs.map((tab) => (
                                <section
                                    key={tab.id}
                                    id={sectionDomId(tab.id)}
                                    data-section-id={tab.id}
                                    aria-labelledby={`${sectionDomId(tab.id)}-title`}
                                    className="scroll-mt-[calc(var(--site-header-height,4rem)+1.5rem)]"
                                >
                                    <TabPanelContent
                                        tab={tab}
                                        titleId={`${sectionDomId(tab.id)}-title`}
                                        onOpenListener={onOpenListener}
                                    />
                                </section>
                            ))}
                        </div>
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

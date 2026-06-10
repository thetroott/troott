'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { track } from '@vercel/analytics';

import { whyTroottContent } from '@/_data/troott/why-troott';
import Newsletter from '@/components/NewsletterModal';
import { GetTroottButton } from '@/components/ui/get-troott-button';
import { cx } from '@/lib/utils';

import { useWhyTroottTabs } from './useWhyTroottTabs';

export function WhyTroottTabsSection() {
    const { label, heading, headingMuted, tabs } = whyTroottContent;
    const { activeTabId, setActiveTabId, onTabKeyDown } = useWhyTroottTabs();
    const [dialogOpen, setDialogOpen] = useState(false);

    const activeTab =
        tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]!;

    const onOpenListener = () => {
        track('listenerSignup', { source: 'why-troott-tabs' });
        setDialogOpen(true);
    };

    return (
        <>
            <section
                id="why-troott-tabs"
                aria-labelledby="why-troott-tabs-heading"
                className="bg-background py-20 sm:py-28"
            >
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <header className="mb-8">
                        <p className="font-mono text-[13px] leading-none text-zinc-500">
                            {label}
                        </p>
                        <h2
                            id="why-troott-tabs-heading"
                            className="mt-5 font-matter-semibold text-[2.75rem] leading-[1.05] tracking-[-0.03em] text-white lg:text-[3.5rem]"
                        >
                            <span className="block">{heading}</span>
                            <span className="block text-zinc-500">
                                {headingMuted}
                            </span>
                        </h2>
                    </header>

                    <nav aria-label="Why Troott products" className="mb-8">
                        <ul
                            role="tablist"
                            className="flex flex-wrap gap-2"
                        >
                            {tabs.map((tab, index) => {
                                const isActive = tab.id === activeTabId;

                                return (
                                    <li key={tab.id} role="presentation">
                                        <button
                                            type="button"
                                            role="tab"
                                            id={`why-troott-tab-${tab.id}`}
                                            aria-selected={isActive}
                                            aria-controls="why-troott-tabs-panel"
                                            tabIndex={isActive ? 0 : -1}
                                            onClick={() =>
                                                setActiveTabId(tab.id)
                                            }
                                            onKeyDown={(event) =>
                                                onTabKeyDown(event, index)
                                            }
                                            className={cx(
                                                'h-10 rounded-full px-5 text-sm font-normal transition-colors',
                                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                                isActive
                                                    ? 'bg-white text-black'
                                                    : 'bg-[#262626] text-zinc-400 hover:bg-[#333333] hover:text-zinc-200',
                                            )}
                                        >
                                            {tab.navLabel}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div
                        id="why-troott-tabs-panel"
                        role="tabpanel"
                        aria-labelledby={`why-troott-tab-${activeTab.id}`}
                    >
                        <div className="relative mb-10 aspect-[16/10] min-h-[320px] w-full overflow-hidden rounded-[20px]">
                            <Image
                                key={activeTab.id}
                                src={activeTab.image.src}
                                alt={activeTab.image.alt}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 1232px"
                                priority={activeTab.id === 'listen'}
                            />
                        </div>

                        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
                            <div className="min-w-0 flex-1">
                                <p className="mb-3 text-sm leading-5 text-zinc-500">
                                    {activeTab.eyebrow}
                                </p>
                                <p className="max-w-[28rem] text-[15px] leading-[1.65] text-zinc-400 sm:text-base sm:leading-[1.7]">
                                    {activeTab.description}
                                </p>
                            </div>

                            <div className="shrink-0 self-start md:self-end">
                                {activeTab.cta.useGetTroott ? (
                                    <GetTroottButton
                                        variant="pill"
                                        labelMode="full"
                                        label={activeTab.cta.label}
                                        onFallback={onOpenListener}
                                    />
                                ) : (
                                    <Link
                                        href={activeTab.cta.href ?? '#'}
                                        target={
                                            activeTab.cta.external
                                                ? '_blank'
                                                : undefined
                                        }
                                        rel={
                                            activeTab.cta.external
                                                ? 'noopener noreferrer'
                                                : undefined
                                        }
                                        className="inline-flex h-10 items-center rounded-sm bg-white px-6 py-2.5 text-sm font-normal text-black hover:bg-white/90"
                                    >
                                        {activeTab.cta.label}
                                    </Link>
                                )}
                            </div>
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

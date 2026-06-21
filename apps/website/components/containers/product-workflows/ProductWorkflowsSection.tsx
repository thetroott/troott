'use client';

import Image from 'next/image';
import { useMemo, type KeyboardEvent } from 'react';

import type { ProductWorkflowsContent } from '@/_data/troott/why-troott';
import {
    productWorkflowsContent,
    type WhyTroottTab,
} from '@/_data/troott/why-troott';
import { cx } from '@/lib/utils';

import { useProductWorkflowsTabs } from './useProductWorkflowsTabs';

function VerticalTabList({
    tabs,
    activeTabId,
    onSelect,
    onTabKeyDown,
}: {
    tabs: WhyTroottTab[];
    activeTabId: string;
    onSelect: (id: WhyTroottTab['id']) => void;
    onTabKeyDown: (
        event: KeyboardEvent<HTMLButtonElement>,
        index: number,
    ) => void;
}) {
    return (
        <nav aria-label="Troott product workflows" className="hidden lg:block">
            <ul role="tablist" className="flex flex-col">
                {tabs.map((tab, index) => {
                    const isActive = tab.id === activeTabId;

                    return (
                        <li
                            key={tab.id}
                            role="presentation"
                            className={cx(
                                'border-b border-white/10',
                                isActive && 'my-2',
                            )}
                        >
                            <button
                                type="button"
                                role="tab"
                                id={`product-workflows-tab-${tab.id}`}
                                aria-selected={isActive}
                                aria-controls="product-workflows-panel"
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => onSelect(tab.id)}
                                onKeyDown={(event) => onTabKeyDown(event, index)}
                                className={cx(
                                    'w-full text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                    isActive
                                        ? 'relative rounded-lg bg-[#161616] p-6'
                                        : 'bg-transparent py-5 text-base font-medium text-zinc-600 hover:text-zinc-400 lg:text-lg',
                                )}
                            >
                                {isActive ? (
                                    <>
                                        <span
                                            className="absolute inset-x-0 top-0 h-0.5 rounded-t-lg bg-violet-500"
                                            aria-hidden
                                        />
                                        <span className="mb-3 block text-lg font-semibold text-white lg:text-xl">
                                            {tab.navLabel}
                                        </span>
                                        <p className="text-sm leading-[1.65] text-zinc-400 lg:text-[15px]">
                                            {tab.description}
                                        </p>
                                    </>
                                ) : (
                                    tab.navLabel
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

function MobileTabChips({
    tabs,
    activeTabId,
    onSelect,
}: {
    tabs: WhyTroottTab[];
    activeTabId: string;
    onSelect: (id: WhyTroottTab['id']) => void;
}) {
    return (
        <div className="lg:hidden">
            <div
                role="tablist"
                aria-label="Troott product workflows"
                className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
            >
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTabId;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            id={`product-workflows-tab-${tab.id}`}
                            aria-selected={isActive}
                            aria-controls="product-workflows-panel"
                            onClick={() => onSelect(tab.id)}
                            className={cx(
                                'h-9 shrink-0 rounded-lg border px-4 text-sm font-medium transition-colors',
                                isActive
                                    ? 'border-transparent border-t-2 border-t-violet-500 bg-[#161616] text-white'
                                    : 'border-white/10 bg-transparent text-zinc-500',
                            )}
                        >
                            {tab.navLabel}
                        </button>
                    );
                })}
            </div>
            <p className="mt-4 text-sm leading-[1.65] text-zinc-400 lg:hidden">
                {tabs.find((tab) => tab.id === activeTabId)?.description}
            </p>
        </div>
    );
}

export function ProductWorkflowsSection({
    content = productWorkflowsContent,
}: {
    content?: ProductWorkflowsContent;
}) {
    const { activeTabId, setActiveTabId, onTabKeyDown } =
        useProductWorkflowsTabs(content);

    const activeTab = useMemo(
        () => content.tabs.find((tab) => tab.id === activeTabId) ?? content.tabs[0]!,
        [content.tabs, activeTabId],
    );

    return (
        <section
            id="product-workflows"
            aria-labelledby="product-workflows-heading"
            className="bg-background py-20 sm:py-28"
        >
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500 sm:text-xs">
                    {content.label}
                </p>
                <h2
                    id="product-workflows-heading"
                    className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:text-[2.5rem] lg:text-[2.75rem]"
                >
                    {content.heading}
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-[1.6] text-zinc-400 lg:text-lg">
                    {content.subtitle}
                </p>

                <div className="mt-8 h-px w-full bg-white/10" />

                <MobileTabChips
                    tabs={content.tabs}
                    activeTabId={activeTabId}
                    onSelect={setActiveTabId}
                />

                <div className="mt-8 lg:grid lg:grid-cols-[minmax(280px,360px)_1fr] lg:items-start lg:gap-12 xl:gap-16">
                    <VerticalTabList
                        tabs={content.tabs}
                        activeTabId={activeTabId}
                        onSelect={setActiveTabId}
                        onTabKeyDown={onTabKeyDown}
                    />

                    <div
                        id="product-workflows-panel"
                        role="tabpanel"
                        aria-labelledby={`product-workflows-tab-${activeTab.id}`}
                    >
                        <div className="relative aspect-[16/10] min-h-[320px] w-full overflow-hidden">
                            <Image
                                key={activeTab.id}
                                src={activeTab.image.src}
                                alt={activeTab.image.alt}
                                fill
                                className="object-cover motion-reduce:transition-none transition-opacity duration-200 ease-out"
                                sizes="(max-width: 1024px) 100vw, 58vw"
                                priority={activeTab.id === content.defaultTabId}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

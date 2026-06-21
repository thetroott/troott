'use client';

import Image from 'next/image';
import { useMemo, type KeyboardEvent } from 'react';

import type { ProductWorkflowsContent } from '@/_data/troott/why-troott';
import {
    productWorkflowsContent,
    type WhyTroottTab,
} from '@/_data/troott/why-troott';
import { cx } from '@/lib/utils';

import {
    useProductWorkflowsTabs,
    type ProductWorkflowsTabProgressStyle,
} from './useProductWorkflowsTabs';

function TabProgressLine({
    tabId,
    cycleKey,
    durationMs,
    isPaused,
    animateProgress,
    className,
}: {
    tabId: string;
    cycleKey: number;
    durationMs: number;
    isPaused: boolean;
    animateProgress: boolean;
    className?: string;
}) {
    if (!animateProgress) {
        return (
            <span
                aria-hidden
                className={cx(
                    'absolute bottom-0 left-0 h-0.5 w-full origin-left bg-teal-500',
                    className,
                )}
            />
        );
    }

    return (
        <span
            key={`${tabId}-${cycleKey}`}
            aria-hidden
            className={cx(
                'absolute bottom-0 left-0 h-0.5 w-full origin-left bg-teal-500 animate-tab-progress-fill',
                className,
            )}
            style={
                {
                    '--tab-duration': `${durationMs}ms`,
                    animationPlayState: isPaused ? 'paused' : 'running',
                } as ProductWorkflowsTabProgressStyle
            }
        />
    );
}

function VerticalTabList({
    tabs,
    activeTabId,
    cycleKey,
    durationMs,
    isPaused,
    animateProgress,
    onSelect,
    onTabKeyDown,
}: {
    tabs: WhyTroottTab[];
    activeTabId: string;
    cycleKey: number;
    durationMs: number;
    isPaused: boolean;
    animateProgress: boolean;
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
                            className="relative border-b border-white/10"
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
                                        ? 'rounded-lg bg-[#161616] p-6'
                                        : 'bg-transparent py-5 text-base font-medium text-zinc-600 hover:text-zinc-400 lg:text-lg',
                                )}
                            >
                                {isActive ? (
                                    <>
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

                            {isActive ? (
                                <>
                                    <span
                                        aria-hidden
                                        className="absolute bottom-0 left-0 h-0.5 w-full bg-white/10"
                                    />
                                    <TabProgressLine
                                        tabId={tab.id}
                                        cycleKey={cycleKey}
                                        durationMs={durationMs}
                                        isPaused={isPaused}
                                        animateProgress={animateProgress}
                                    />
                                </>
                            ) : null}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

function TabProgressRing({
    tabId,
    cycleKey,
    durationMs,
    isPaused,
    animateProgress,
}: {
    tabId: string;
    cycleKey: number;
    durationMs: number;
    isPaused: boolean;
    animateProgress: boolean;
}) {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;

    if (!animateProgress) {
        return (
            <svg
                aria-hidden
                className="absolute inset-0 h-full w-full -rotate-90"
                viewBox="0 0 44 44"
            >
                <circle
                    cx="22"
                    cy="22"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-teal-500"
                />
            </svg>
        );
    }

    return (
        <svg
            key={`${tabId}-${cycleKey}`}
            aria-hidden
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 44 44"
        >
            <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/15"
            />
            <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-teal-500 animate-tab-progress-ring"
                style={
                    {
                        strokeDasharray: circumference,
                        strokeDashoffset: circumference,
                        '--ring-circumference': `${circumference}`,
                        '--tab-duration': `${durationMs}ms`,
                        animationPlayState: isPaused ? 'paused' : 'running',
                    } as ProductWorkflowsTabProgressStyle
                }
            />
        </svg>
    );
}

function MobileFloatingStepOrb({
    tabs,
    activeTabId,
    cycleKey,
    durationMs,
    isPaused,
    animateProgress,
    onSelect,
}: {
    tabs: WhyTroottTab[];
    activeTabId: string;
    cycleKey: number;
    durationMs: number;
    isPaused: boolean;
    animateProgress: boolean;
    onSelect: (id: WhyTroottTab['id']) => void;
}) {
    const activeIndex = Math.max(
        0,
        tabs.findIndex((tab) => tab.id === activeTabId),
    );
    const activeTab = tabs[activeIndex] ?? tabs[0]!;
    const nextTab = tabs[(activeIndex + 1) % tabs.length]!;

    return (
        <>
            <div className="sr-only">
                <div role="tablist" aria-label="Troott product workflows">
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            id={`product-workflows-tab-${tab.id}`}
                            aria-selected={tab.id === activeTabId}
                            aria-controls="product-workflows-panel"
                            onClick={() => onSelect(tab.id)}
                        >
                            {tab.navLabel}, step {index + 1}
                        </button>
                    ))}
                </div>
            </div>

            <button
                type="button"
                aria-label={`${activeTab.navLabel}, step ${activeIndex + 1} of ${tabs.length}. Tap for next step.`}
                onClick={() => onSelect(nextTab.id)}
                className="absolute bottom-4 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 lg:hidden"
            >
                <TabProgressRing
                    tabId={activeTab.id}
                    cycleKey={cycleKey}
                    durationMs={durationMs}
                    isPaused={isPaused}
                    animateProgress={animateProgress}
                />
                <span
                    key={activeTabId}
                    aria-hidden
                    className="relative z-[1] text-sm font-semibold tabular-nums motion-reduce:animate-none animate-step-indicator-swap"
                >
                    {activeIndex + 1}
                </span>
            </button>
        </>
    );
}

function MobileTabCaption({ tab }: { tab: WhyTroottTab }) {
    return (
        <div className="mt-4 lg:hidden">
            <p className="text-xs font-medium uppercase tracking-[0.06em] text-zinc-500">
                {tab.navLabel}
            </p>
            <p className="mt-1 text-sm leading-[1.65] text-zinc-400">
                {tab.description}
            </p>
        </div>
    );
}

export function ProductWorkflowsSection({
    content = productWorkflowsContent,
}: {
    content?: ProductWorkflowsContent;
}) {
    const {
        activeTabId,
        selectTab,
        onTabKeyDown,
        cycleKey,
        isPaused,
        pause,
        resume,
        tabAutoDurationMs,
        animateProgress,
    } = useProductWorkflowsTabs(content);

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

                <div
                    className="relative"
                    onPointerEnter={pause}
                    onPointerLeave={resume}
                    onFocusCapture={pause}
                    onBlurCapture={(event) => {
                        const next = event.relatedTarget;
                        if (
                            next instanceof Node &&
                            event.currentTarget.contains(next)
                        ) {
                            return;
                        }
                        resume();
                    }}
                >
                <div className="mt-8 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(280px,360px)_1fr] lg:items-start lg:gap-12 xl:gap-16">
                    <VerticalTabList
                        tabs={content.tabs}
                        activeTabId={activeTabId}
                        cycleKey={cycleKey}
                        durationMs={tabAutoDurationMs}
                        isPaused={isPaused}
                        animateProgress={animateProgress}
                        onSelect={selectTab}
                        onTabKeyDown={onTabKeyDown}
                    />

                    <div
                        id="product-workflows-panel"
                        role="tabpanel"
                        aria-labelledby={`product-workflows-tab-${activeTab.id}`}
                        className="relative"
                    >
                        <div className="relative aspect-[16/10] min-h-[320px] w-full overflow-hidden rounded-sm">
                            <Image
                                key={activeTab.id}
                                src={activeTab.image.src}
                                alt={activeTab.image.alt}
                                fill
                                className="object-cover motion-reduce:transition-none transition-opacity duration-200 ease-out"
                                sizes="(max-width: 1024px) 100vw, 58vw"
                                priority={activeTab.id === content.defaultTabId}
                            />

                            <MobileFloatingStepOrb
                                tabs={content.tabs}
                                activeTabId={activeTabId}
                                cycleKey={cycleKey}
                                durationMs={tabAutoDurationMs}
                                isPaused={isPaused}
                                animateProgress={animateProgress}
                                onSelect={selectTab}
                            />
                        </div>

                        <MobileTabCaption tab={activeTab} />
                    </div>
                </div>
                </div>
            </div>
        </section>
    );
}

'use client';

import type { CSSProperties } from 'react';

import { faqsContent, type FaqsContent } from '@/_data/troott/faqs';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/Accordion';
import { cx } from '@/lib/utils';

function FaqsHeader({
    content,
    className,
    style,
}: {
    content: FaqsContent;
    className?: string;
    style?: CSSProperties;
}) {
    const { label, heading, headingMuted } = content;

    return (
        <header className={className} style={style}>
            <p className="font-mono text-[13px] leading-none text-zinc-500">
                {label}
            </p>
            <h2
                id="faqs-section-heading"
                className="mt-5 text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] lg:whitespace-nowrap lg:text-[2.5rem]"
            >
                <span className="block text-white lg:inline">{heading}</span>
                <span className="block text-zinc-500 lg:inline">
                    {' '}
                    {headingMuted}
                </span>
            </h2>
        </header>
    );
}

type FaqsSectionProps = {
    content?: FaqsContent;
};

export function FaqsSection({ content = faqsContent }: FaqsSectionProps) {
    const { items } = content;

    return (
        <section
            id="faqs-section"
            aria-labelledby="faqs-section-heading"
            className="bg-background py-24 sm:py-32 lg:py-40"
        >
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start lg:gap-x-16 xl:gap-x-24">
                    <div className="relative hidden shrink-0 lg:block">
                        <FaqsHeader
                            content={content}
                            className="sticky z-10"
                            style={{
                                top: 'calc(var(--site-header-height, 4rem) + 1.5rem)',
                            }}
                        />
                    </div>

                    <div className="min-w-0">
                        <FaqsHeader content={content} className="mb-12 lg:hidden" />

                        <Accordion
                            type="single"
                            collapsible
                            className="flex flex-col gap-3"
                        >
                            {items.map((item) => (
                                <AccordionItem
                                    key={item.id}
                                    value={item.id}
                                    className={cx(
                                        'overflow-hidden rounded-lg border border-white/10 bg-[#111111] p-6',
                                        'border-b border-white/10 first:mt-0',
                                    )}
                                >
                                    <AccordionTrigger className="py-0 text-lg font-medium leading-7 text-white">
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="mt-4 text-base leading-[1.6] text-zinc-400">
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    );
}

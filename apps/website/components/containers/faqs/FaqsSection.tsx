'use client';

import type { CSSProperties } from 'react';

import { faqsContent } from '@/_data/troott/faqs';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/Accordion';
import { cx } from '@/lib/utils';

function FaqsHeader({
    className,
    style,
}: {
    className?: string;
    style?: CSSProperties;
}) {
    const { label, heading, headingMuted } = faqsContent;

    return (
        <header className={className} style={style}>
            <p className="font-mono text-[13px] leading-none text-zinc-500">
                {label}
            </p>
            <h2
                id="faqs-section-heading"
                className="mt-5 font-semibold text-[2.75rem] leading-[1.05] tracking-[-0.03em] text-white lg:text-[3.5rem]"
            >
                <span className="block">{heading}</span>
                <span className="block text-zinc-500">{headingMuted}</span>
            </h2>
        </header>
    );
}

export function FaqsSection() {
    const { items } = faqsContent;

    return (
        <section
            id="faqs-section"
            aria-labelledby="faqs-section-heading"
            className="bg-background py-24 sm:py-32 lg:py-40"
        >
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="lg:grid lg:grid-cols-[minmax(280px,360px)_1fr] lg:gap-12 xl:gap-20">
                    <div className="relative hidden lg:block">
                        <FaqsHeader
                            className="sticky z-10"
                            style={{
                                top: 'calc(var(--site-header-height, 4rem) + 1.5rem)',
                            }}
                        />
                    </div>

                    <div>
                        <FaqsHeader className="mb-12 lg:hidden" />

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

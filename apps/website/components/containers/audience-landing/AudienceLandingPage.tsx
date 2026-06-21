'use client';

import { useState } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';

import type { AudienceLandingContent } from '@/_data/troott/audience-landing';
import Newsletter from '@/components/NewsletterModal';
import { Button } from '@/components/ui/button';
import { GetTroottButton } from '@/components/ui/get-troott-button';
import { cx } from '@/lib/utils';

type AudienceLandingPageProps = {
    content: AudienceLandingContent;
    showHero?: boolean;
};

export function AudienceLandingPage({
    content,
    showHero = true,
}: AudienceLandingPageProps) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const openListenerModal = () => {
        track('listenerSignup', { source: `${content.audience}_landing` });
        setDialogOpen(true);
    };

    return (
        <>
            {showHero ? (
                <section
                    aria-labelledby={`${content.audience}-landing-heading`}
                    className="w-full bg-background pb-16 pt-14 md:pt-32 lg:pb-24"
                >
                    <div className="container mx-auto max-w-7xl px-4 md:px-6">
                        <div className="mx-auto max-w-[640px] text-center">
                            <p className="font-mono text-[13px] leading-none text-zinc-500">
                                {content.eyebrow}
                            </p>
                            <h1
                                id={`${content.audience}-landing-heading`}
                                className="mt-5 text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white lg:text-5xl"
                            >
                                {content.headline}
                                <span className="block text-zinc-500">
                                    {content.headlineMuted}
                                </span>
                            </h1>
                            <p className="mt-6 text-base leading-relaxed text-zinc-400 md:text-lg">
                                {content.subtext}
                            </p>
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                {content.primaryCta.kind === 'get-troott' ? (
                                    <GetTroottButton
                                        label={content.primaryCta.label}
                                        showShortcut
                                        shortcutClassName="hidden"
                                        onFallback={openListenerModal}
                                        className="h-11 rounded-sm px-5 text-base font-normal"
                                    />
                                ) : (
                                    <Button
                                        asChild
                                        size="lg"
                                        className="h-11 rounded-sm px-5 text-base font-normal"
                                    >
                                        <Link
                                            href={content.primaryCta.href}
                                            target={
                                                content.primaryCta.external
                                                    ? '_blank'
                                                    : undefined
                                            }
                                            rel={
                                                content.primaryCta.external
                                                    ? 'noopener noreferrer'
                                                    : undefined
                                            }
                                        >
                                            {content.primaryCta.label}
                                        </Link>
                                    </Button>
                                )}
                                {content.secondaryCta ? (
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="lg"
                                        className={cx(
                                            'h-11 rounded-sm px-5 text-base font-normal',
                                            'border-foreground/30 bg-background text-foreground',
                                            'hover:bg-muted hover:text-foreground',
                                        )}
                                    >
                                        <Link
                                            href={content.secondaryCta.href}
                                            target={
                                                content.secondaryCta.external
                                                    ? '_blank'
                                                    : undefined
                                            }
                                            rel={
                                                content.secondaryCta.external
                                                    ? 'noopener noreferrer'
                                                    : undefined
                                            }
                                        >
                                            {content.secondaryCta.label}
                                        </Link>
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </section>
            ) : null}

            <section
                aria-labelledby={`${content.audience}-value-props-heading`}
                className="bg-[#0d0d0d] py-20 lg:py-28"
            >
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <h2 id={`${content.audience}-value-props-heading`} className="sr-only">
                        Why Troott for {content.audience === 'listener' ? 'listeners' : 'ministers'}
                    </h2>
                    <ul className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
                        {content.valueProps.map((item) => (
                            <li
                                key={item.title}
                                className="rounded-xl border border-white/10 p-6"
                            >
                                <h3 className="text-lg font-medium text-white">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                                    {item.description}
                                </p>
                            </li>
                        ))}
                    </ul>

                    <p className="mt-12 text-center text-sm text-zinc-400">
                        {content.crossLink.prefix}{' '}
                        <Link
                            href={content.crossLink.href}
                            className="font-medium text-white underline underline-offset-4 hover:text-white/90"
                        >
                            {content.crossLink.linkLabel}
                        </Link>
                    </p>
                </div>
            </section>

            {content.audience === 'listener' ? (
                <Newsletter
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    user_type="listener"
                />
            ) : null}
        </>
    );
}

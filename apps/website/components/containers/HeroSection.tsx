'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RiUploadCloudFill } from '@remixicon/react';

import type { HeroSectionContent } from '@/_data/troott/audience-landing';
import Newsletter from '@/components/NewsletterModal';
import { Button } from '@/components/ui/button';
import ThemedImage from '@/components/containers/ThemedImage';
import { GetTroottButton } from '../ui/get-troott-button';
import { cx } from '@/lib/utils';

type HeroSectionProps = {
    content: HeroSectionContent;
};

const primaryButtonClassName =
    'h-11 rounded-sm px-5 text-base font-normal inline-flex items-center gap-2 rounded-sm bg-foreground text-background hover:bg-foreground/90';

export default function HeroSection({ content }: HeroSectionProps) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const openListenerModal = () => {
        setDialogOpen(true);
    };

    return (
        <>
            <section className="mb-24 w-full bg-background pt-14 md:pt-32">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="flex flex-col gap-8 text-left md:items-center md:text-center">
                        <div className="w-full min-w-0 max-w-4xl space-y-6 md:mx-auto">
                            <h1
                                id={`${content.audience}-hero-heading`}
                                className="mt-5 text-[2.5rem] font-semibold leading-[1.05] text-pretty tracking-[-0.03em] text-white lg:text-6xl"
                            >
                                {content.headline}
                                <span className="sm:block text-zinc-500">
                                    {' '}
                                    {content.headlineMuted}
                                </span>
                            </h1>
                            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:mx-auto">
                                {content.subtext}
                            </p>
                            <div className="flex flex-wrap items-center justify-start gap-4 md:justify-center">
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
                                        className={primaryButtonClassName}
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
                                            className="inline-flex items-center gap-2"
                                        >
                                            {content.primaryCtaIcon === 'upload' ? (
                                                <RiUploadCloudFill
                                                    aria-hidden="true"
                                                    className="size-4 shrink-0"
                                                />
                                            ) : null}
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
                                            'shadow-sm transition-colors',
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
                                            className="inline-flex items-center gap-2"
                                        >
                                            {content.secondaryCtaIcon === 'upload' ? (
                                                <RiUploadCloudFill
                                                    aria-hidden="true"
                                                    className="size-4 shrink-0"
                                                />
                                            ) : null}
                                            {content.secondaryCta.label}
                                        </Link>
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative mx-auto mt-20 h-fit w-full max-w-[80rem] animate-slide-up-fade sm:px-2"
                        style={{ animationDuration: '1400ms' }}
                    >
                        <ThemedImage
                            src={content.heroImage.src}
                            alt={content.heroImage.alt}
                            width={2400}
                            height={1600}
                            className="rounded-sm"
                        />
                        <div
                            className="absolute inset-x-0 -bottom-20 h-2/4 bg-gradient-to-t from-background via-background to-transparent lg:h-1/4"
                            aria-hidden="true"
                        />
                    </div>
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

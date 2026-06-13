'use client';

import Link from 'next/link';
import { RiUploadCloudFill } from '@remixicon/react';
import { cx } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import HeroImage from '@/components/ui/HeroImage';
import { siteConfig } from '@/app/siteConfig';
import { GetTroottButton } from '../ui/get-troott-button';

export default function HeroSection() {
    return (
        <section className="mb-24 w-full bg-background pt-14 md:pt-32">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="flex flex-col gap-8 text-left md:items-center md:text-center">
                    <div className="w-full min-w-0 max-w-4xl space-y-6 md:mx-auto">
                        <h1
                            id={`hero-landing-heading`}
                            className="mt-5 text-[2.5rem] font-semibold leading-[1.05] text-pretty tracking-[-0.03em] text-white lg:text-6xl"
                        >
                            All the sermons and teachings
                            <span className="sm:block text-zinc-500">
                                {' '}
                                you love, in one place.
                            </span>
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:mx-auto">
                            Find powerful messages from your favourite
                            ministers. Listen anytime, share with friends and
                            family, and stay rooted in God&apos;s Word.
                        </p>
                        <div className="flex flex-wrap items-center justify-start gap-4 md:justify-center">
                            <GetTroottButton
                                label="Start listening"
                                showShortcut
                                onFallback={() => {}}
                                className="h-11 rounded-sm px-5 text-base font-normal"
                            />
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
                                    href={siteConfig.baseLinks.ministers}
                                    className="inline-flex items-center gap-2"
                                >
                                    <RiUploadCloudFill
                                        aria-hidden="true"
                                        className="size-4 shrink-0"
                                    />
                                    Upload sermons
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div
                    className="relative mx-auto mt-20 h-fit w-full max-w-[40rem] animate-slide-up-fade sm:px-2"
                    style={{ animationDuration: '1400ms' }}
                >
                    <HeroImage />
                    <div
                        className="absolute inset-x-0 -bottom-20 h-2/4 bg-gradient-to-t from-neutral-950 via-neutral-950 to-transparent lg:h-1/4"
                        aria-hidden="true"
                    />
                </div>
            </div>
        </section>
    );
}

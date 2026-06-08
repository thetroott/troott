'use client';

import Link from 'next/link';
import { RiPlayCircleFill, RiUploadCloudFill } from '@remixicon/react';
import { cx } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import HeroImage from '@/components/ui/HeroImage';
import { siteConfig } from '@/app/siteConfig';

export default function HeroSection() {
    return (
        <section className="mb-24 w-full bg-background pt-14 md:pt-32">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="flex flex-col gap-8 text-left md:items-center md:text-center">
                    <div className="w-full min-w-0 max-w-4xl space-y-6 md:mx-auto">
                        <h1 className="text-pretty text-4xl font-normal tracking-tight text-foreground md:text-balance md:text-5xl">
                            All the sermons and teachings you love, in one
                            place.
                        </h1>
                        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:mx-auto">
                            Find powerful messages from your favourite
                            ministers. Listen anytime, share with friends and
                            family, and stay rooted in God&apos;s Word.
                        </p>
                        <div className="flex flex-wrap items-center justify-start gap-4 md:justify-center">
                            <Button
                                asChild
                                size="lg"
                                className={cx(
                                    'h-11 rounded-md px-5 text-base font-medium',
                                    'bg-foreground text-background hover:bg-foreground/90',
                                    'shadow-sm transition-colors',
                                )}
                            >
                                <Link
                                    href={siteConfig.baseLinks.listeners}
                                    className="inline-flex items-center gap-2"
                                >
                                    Start listening
                                    <RiPlayCircleFill
                                        aria-hidden="true"
                                        className="size-4 shrink-0"
                                    />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className={cx(
                                    'h-11 rounded-md px-5 text-base font-medium',
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
                    className="relative mx-auto ml-3 mt-20 h-fit w-[40rem] max-w-6xl animate-slide-up-fade sm:ml-auto sm:w-full sm:px-2"
                    style={{ animationDuration: '1400ms' }}
                >
                    <HeroImage />
                    <div
                        className="absolute inset-x-0 -bottom-20 -mx-10 h-2/4 bg-gradient-to-t from-neutral-950 via-neutral-950 to-transparent lg:h-1/4"
                        aria-hidden="true"
                    />
                </div>
            </div>
        </section>
    );
}

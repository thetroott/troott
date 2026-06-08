'use client';

import Link from 'next/link';
import { ArrowRightToLineIcon, Calendar } from 'lucide-react';
import { cx } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/app/siteConfig';

export default function HeroSectionAlt() {
    return (
        <section className="mb-24 w-full bg-background pt-14 md:pt-24">
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
                                    <ArrowRightToLineIcon
                                        className="size-4"
                                        strokeWidth={2.5}
                                        aria-hidden
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
                                    <Calendar
                                        className="size-4"
                                        strokeWidth={2.5}
                                        aria-hidden
                                    />
                                    Upload your sermons
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

import Link from 'next/link';
import { RiArrowLeftLine } from '@remixicon/react';

import { siteConfig } from '@/app/siteConfig';
import { Button } from '@/components/ui/button';
import { cx } from '@/lib/utils';

export function NotFoundContent() {
    return (
        <section
            aria-labelledby="not-found-heading"
            className="flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center px-4 py-16 text-center"
        >
            <div className="mx-auto flex w-full max-w-lg flex-col items-center">
                <p className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                    404
                </p>
                <h1
                    id="not-found-heading"
                    className="mt-4 text-2xl font-semibold text-zinc-100"
                >
                    Page not found
                </h1>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">
                    Sorry, we couldn&apos;t find the page you&apos;re looking
                    for.
                </p>
                <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className={cx(
                        'mt-8 h-10 rounded-sm px-5 text-sm font-normal',
                        'border-foreground/30 bg-background text-foreground',
                        'hover:bg-muted hover:text-foreground',
                    )}
                >
                    <Link
                        href={siteConfig.baseLinks.home}
                        className="inline-flex items-center gap-2"
                    >
                        <RiArrowLeftLine
                            aria-hidden="true"
                            className="size-4 shrink-0"
                        />
                        Back to home
                    </Link>
                </Button>
            </div>
        </section>
    );
}

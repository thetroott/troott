'use client';

import Image from 'next/image';

import { appShowcaseContent } from '@/_data/troott/app-showcase';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';
import { cx } from '@/lib/utils';

import { ShowcaseMarqueeRow } from './ShowcaseMarqueeRow';

function ShowcaseEdgeFade() {
    return (
        <>
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-background to-transparent sm:w-24 md:w-32 lg:w-40" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-background to-transparent sm:w-24 md:w-32 lg:w-40" />
            <ProgressiveBlur
                className="pointer-events-none absolute inset-y-0 left-0 z-20 h-full w-12 sm:w-16 md:w-24"
                direction="left"
                blurIntensity={1}
            />
            <ProgressiveBlur
                className="pointer-events-none absolute inset-y-0 right-0 z-20 h-full w-12 sm:w-16 md:w-24"
                direction="right"
                blurIntensity={1}
            />
        </>
    );
}

export function AppShowcaseSection({ className }: { className?: string }) {
    const { phone, rows } = appShowcaseContent;

    return (
        <section
            id="app-showcase"
            aria-label="Troott app showcase"
            className={cx('overflow-hidden bg-background pt-0 pb-12 lg:pb-16', className)}
        >
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="relative -mx-4 w-[calc(100%+2rem)] sm:mx-0 sm:w-full">
                    <ShowcaseEdgeFade />

                    <div className="relative z-10 flex min-h-[420px] items-center justify-center sm:min-h-[480px] lg:min-h-[560px]">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-[calc(50%+64px)] sm:-translate-y-[calc(50%+76px)] lg:-translate-y-[calc(50%+88px)]">
                            <ShowcaseMarqueeRow tiles={rows[0].tiles} />
                        </div>
                        <div className="absolute inset-x-0 top-1/2 translate-y-3 sm:translate-y-5 lg:translate-y-6">
                            <ShowcaseMarqueeRow tiles={rows[1].tiles} reverse />
                        </div>
                        <div className="relative z-30">
                            <Image
                                src={phone.src}
                                alt={phone.alt}
                                width={phone.width}
                                height={560}
                                className="h-auto w-[270px] drop-shadow-[0_24px_48px_rgba(0,0,0,0.55)] sm:w-[272px] lg:w-[410px]"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

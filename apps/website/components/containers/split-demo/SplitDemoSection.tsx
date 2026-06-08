import Image from 'next/image';
import Link from 'next/link';

import { cx } from '@/lib/utils';

import type { SplitDemoSectionProps } from './types';

function SplitDemoContent({
    label = 'GET STARTED',
    heading,
    description,
    cta,
    reversed = false,
}: Pick<
    SplitDemoSectionProps,
    'label' | 'heading' | 'description' | 'cta' | 'reversed'
>) {
    return (
        <div
            className={cx(
                'flex h-full min-h-[400px] flex-col justify-between bg-black px-10 py-10 sm:px-12 sm:py-11 lg:px-14 lg:py-12',
                reversed ? 'md:order-2' : 'md:order-1',
            )}
        >
            <div>
                <p className="flex items-center gap-2.5 font-mono text-[13px] uppercase tracking-[0.12em] text-zinc-500">
                    <span
                        className="inline-block size-1 shrink-0 bg-zinc-500"
                        aria-hidden
                    />
                    {label}
                </p>
                <h2 className="mt-6 max-w-[20rem] text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:max-w-[22rem] sm:text-[1.875rem]">
                    {heading}
                </h2>
                <p className="mt-4 max-w-[18rem] text-[15px] leading-[1.65] text-zinc-400">
                    {description}
                </p>
            </div>
            <div className="pt-16 sm:pt-20">
                <Link
                    href={cta.href}
                    target={cta.external ? '_blank' : undefined}
                    rel={cta.external ? 'noopener noreferrer' : undefined}
                    className={cx(
                        'inline-flex h-10 items-center justify-center rounded-full',
                        'bg-white px-5 text-sm font-medium text-black',
                        'transition-colors hover:bg-white/90',
                    )}
                >
                    {cta.label}
                </Link>
            </div>
        </div>
    );
}

function SplitDemoMedia({
    image,
    reversed = false,
}: Pick<SplitDemoSectionProps, 'image' | 'reversed'>) {
    return (
        <div
            className={cx(
                'relative min-h-[280px] overflow-hidden md:min-h-0 md:h-full',
                'bg-gradient-to-br from-[#1c1c1c] via-[#161616] to-[#101010]',
                reversed ? 'md:order-1' : 'md:order-2',
            )}
        >
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.05)_0%,transparent_55%)]"
                aria-hidden
            />
            <div
                className={cx(
                    'absolute bottom-0 top-6 w-[108%] overflow-hidden',
                    'shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.08)]',
                    reversed ? 'left-0 right-auto' : 'right-0 left-auto',
                )}
            >
                <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className={cx(
                        'object-cover',
                        reversed ? 'object-right-top' : 'object-left-top',
                    )}
                    unoptimized
                />
            </div>
        </div>
    );
}

export function SplitDemoSection({
    label,
    heading,
    description,
    cta,
    image,
    reversed = false,
}: SplitDemoSectionProps) {
    return (
        <section className="w-full bg-background py-20 sm:py-28">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="overflow-hidden rounded-xl border border-white/[0.08]">
                    <div className="grid md:h-[420px] md:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
                        <SplitDemoContent
                            label={label}
                            heading={heading}
                            description={description}
                            cta={cta}
                            reversed={reversed}
                        />
                        <SplitDemoMedia image={image} reversed={reversed} />
                    </div>
                </div>
            </div>
        </section>
    );
}

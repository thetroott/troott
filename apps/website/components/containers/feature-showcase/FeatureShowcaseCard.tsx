import Image from 'next/image';
import Link from 'next/link';

import { cx } from '@/lib/utils';

import type { FeatureShowcaseItem } from './types';

type FeatureShowcaseCardProps = FeatureShowcaseItem;

function FeatureShowcaseMedia({
    image,
    reversed = false,
}: Pick<FeatureShowcaseCardProps, 'image' | 'reversed'>) {
    return (
        <div
            className={cx(
                'relative min-h-[300px] overflow-hidden sm:min-h-[360px] md:min-h-full',
                reversed ? 'md:order-2' : 'md:order-1',
            )}
        >
            <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, 58vw"
                className={cx(
                    'object-cover',
                    reversed ? 'object-right' : 'object-left',
                )}
                unoptimized
            />
        </div>
    );
}

function FeatureShowcaseContent({
    title,
    description,
    cta,
    reversed = false,
}: Pick<
    FeatureShowcaseCardProps,
    'title' | 'description' | 'cta' | 'reversed'
>) {
    return (
        <div
            className={cx(
                'flex flex-col justify-center px-8 py-12 sm:px-10 sm:py-14 md:px-12 lg:px-14 xl:px-16',
                reversed ? 'md:order-1' : 'md:order-2',
            )}
        >
            <h3 className="text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-[1.875rem]">
                {title}
            </h3>
            <p className="mt-5 max-w-[22rem] text-[15px] leading-[1.65] text-zinc-400 sm:text-base sm:leading-[1.7]">
                {description}
            </p>
            <div className="mt-8">
                <Link
                    href={cta.href}
                    target={cta.external ? '_blank' : undefined}
                    rel={cta.external ? 'noopener noreferrer' : undefined}
                    className={cx(
                        'inline-flex h-10 items-center justify-center rounded-sm',
                        'bg-white px-4 text-sm font-normal text-black',
                        'transition-colors hover:bg-white/90',
                    )}
                >
                    {cta.label}
                </Link>
            </div>
        </div>
    );
}

export function FeatureShowcaseCard({
    title,
    description,
    cta,
    image,
    reversed = false,
    accentTop = false,
}: FeatureShowcaseCardProps) {
    return (
        <article
            className={cx(
                'relative overflow-hidden rounded-3xl bg-[#111111]',
                accentTop &&
                    'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/55 before:to-transparent',
            )}
        >
            <div className="grid md:min-h-[480px] md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <FeatureShowcaseMedia
                    image={image}
                    reversed={reversed}
                />
                <FeatureShowcaseContent
                    title={title}
                    description={description}
                    cta={cta}
                    reversed={reversed}
                />
            </div>
        </article>
    );
}

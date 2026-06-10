'use client';

import { featuredPartnersContent } from '@/_data/troott/featured-partners';
import { LogoImg } from '@/components/containers/logo-cloud/LogoImg';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';
import { cx } from '@/lib/utils';

import { PartnerCard } from './PartnerCard';

export function FeaturedPartnersSection() {
    const { id, heading, description, partners, stripLogos } =
        featuredPartnersContent;

    return (
        <section
            id={id}
            aria-labelledby={`${id}-heading`}
            className="overflow-hidden bg-background py-24 md:py-28"
        >
            <div className="m-auto max-w-6xl px-6">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-10">
                    <div className="flex flex-col justify-between gap-10">
                        <div>
                            <h2
                                id={`${id}-heading`}
                                className="max-w-md text-[2rem] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-[2.35rem]"
                            >
                                {heading}
                            </h2>
                            <p className="mt-5 max-w-md text-[15px] leading-[1.65] text-zinc-400 sm:text-base sm:leading-[1.7]">
                                {description}
                            </p>
                        </div>

                        <div className="relative hidden lg:block">
                            <InfiniteSlider speed={120} gap={32}>
                                {stripLogos.map((logo) => (
                                    <div
                                        key={logo.src}
                                        className="flex shrink-0 opacity-40"
                                    >
                                        <LogoImg
                                            {...logo}
                                            className={cx(
                                                'h-8 brightness-0 invert',
                                                logo.invertOnDark === false &&
                                                    'dark:invert',
                                            )}
                                        />
                                    </div>
                                ))}
                            </InfiniteSlider>

                            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background" />
                            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background" />
                            <ProgressiveBlur
                                className="pointer-events-none absolute left-0 top-0 h-full w-16"
                                direction="left"
                                blurIntensity={1}
                            />
                            <ProgressiveBlur
                                className="pointer-events-none absolute right-0 top-0 h-full w-16"
                                direction="right"
                                blurIntensity={1}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 opacity-40 lg:hidden">
                            {stripLogos.map((logo) => (
                                <LogoImg
                                    key={logo.src}
                                    {...logo}
                                    className="h-8 brightness-0 invert"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {partners.map((partner) => (
                            <PartnerCard key={partner.id} partner={partner} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

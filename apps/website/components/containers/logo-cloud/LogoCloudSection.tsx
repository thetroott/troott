'use client';

import { logoCloudContent } from '@/_data/troott/logo-cloud';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';

import { LogoImg } from './LogoImg';

export function LogoCloudSection() {
    const { id, label, logos } = logoCloudContent;

    return (
        <section
            id={id}
            aria-label="Technology partners and tools"
            className="overflow-hidden bg-background py-28 md:py-24"
        >
            <div className="group relative m-auto max-w-6xl px-6">
                <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:max-w-44 md:border-r md:border-border md:pr-6">
                        <p className="text-left text-lg text-muted-foreground md:text-end md:text-sm">
                            {label}
                        </p>
                    </div>
                    <div className="relative py-6 md:w-[calc(100%-11rem)]">
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-8 md:hidden">
                            {logos.map((logo) => (
                                <div key={logo.src} className="flex shrink-0">
                                    <LogoImg {...logo} />
                                </div>
                            ))}
                        </div>

                        <div className="hidden md:block">
                            <InfiniteSlider
                                speedOnHover={50}
                                speed={160}
                                gap={24}
                            >
                                {logos.map((logo) => (
                                    <div
                                        key={logo.src}
                                        className="flex shrink-0"
                                    >
                                        <LogoImg {...logo} />
                                    </div>
                                ))}
                            </InfiniteSlider>

                            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background" />
                            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background" />
                            <ProgressiveBlur
                                className="pointer-events-none absolute left-0 top-0 h-full w-20"
                                direction="left"
                                blurIntensity={1}
                            />
                            <ProgressiveBlur
                                className="pointer-events-none absolute right-0 top-0 h-full w-20"
                                direction="right"
                                blurIntensity={1}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

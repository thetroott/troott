import { FeatureShowcaseCard } from './FeatureShowcaseCard';
import type { CoreFeaturesSectionProps } from './types';

export function CoreFeaturesSection({
    label = '// Core features',
    heading,
    headingMuted,
    items,
}: CoreFeaturesSectionProps) {
    return (
        <section
            aria-labelledby="core-features-heading"
            className="w-full bg-background py-20 sm:py-28"
        >
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="mb-12 sm:mb-16">
                    <p className="font-mono text-[13px] leading-none text-zinc-500">
                        {label}
                    </p>
                    <h2
                        id="core-features-heading"
                        className="mt-5 text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.5rem]"
                    >
                        <span className="block">{heading}</span>
                        <span className="block text-zinc-500">{headingMuted}</span>
                    </h2>
                </div>

                <div className="flex flex-col gap-4">
                    {items.map((item) => (
                        <FeatureShowcaseCard key={item.title} {...item} />
                    ))}
                </div>
            </div>
        </section>
    );
}

import { RiCheckLine } from '@remixicon/react';

import { featureHighlightContent } from '@/_data/troott/feature-highlight';
import { Mockup } from '@/components/ui/mockup';
import { Screenshot } from '@/components/ui/screenshot';

export function FeatureHighlightSection() {
    const { id, eyebrow, heading, description, bullets, screenshot } =
        featureHighlightContent;

    return (
        <section
            id={id}
            aria-labelledby={`${id}-heading`}
            className="bg-background py-20 lg:py-28"
        >
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="group overflow-hidden rounded-[40px] bg-[#0a0a0a] lg:min-h-[480px] lg:grid lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
                    <div className="flex flex-col p-10 lg:p-14">
                        <p className="text-sm text-zinc-500">{eyebrow}</p>
                        <h2
                            id={`${id}-heading`}
                            className="mt-4 max-w-[26rem] text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white lg:text-[3rem]"
                        >
                            {heading}
                        </h2>
                        <p className="mt-5 max-w-[26rem] text-base leading-[1.65] text-zinc-400 lg:text-lg">
                            {description}
                        </p>
                        <ul className="mt-8 flex flex-col gap-4">
                            {bullets.map((bullet) => (
                                <li
                                    key={bullet}
                                    className="flex items-start gap-3"
                                >
                                    <span
                                        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#262626]"
                                        aria-hidden="true"
                                    >
                                        <RiCheckLine className="size-3 text-white" />
                                    </span>
                                    <span className="text-base leading-normal text-zinc-400">
                                        {bullet}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex items-end justify-center overflow-hidden">
                        <div className="translate-y-6 transition-transform duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:transition-none md:translate-y-10 md:group-hover:translate-y-4 md:motion-reduce:group-hover:translate-y-0">
                            <Mockup type="mobile">
                                <Screenshot
                                    srcLight={screenshot.src}
                                    srcDark={screenshot.src}
                                    alt={screenshot.alt}
                                    width={screenshot.width}
                                    height={screenshot.height}
                                    className="rounded-[32px]"
                                />
                            </Mockup>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

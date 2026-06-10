import Image from 'next/image';
import { RiCheckLine } from '@remixicon/react';

import { featureHighlightContent } from '@/_data/troott/feature-highlight';

export function FeatureHighlightSection() {
    const { id, eyebrow, heading, description, bullets, screenshot } =
        featureHighlightContent;

    return (
        <section
            id={id}
            aria-labelledby={`${id}-heading`}
            className="bg-stone-950 py-20 lg:py-28"
        >
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="group relative overflow-hidden rounded-[40px] bg-[#0a0a0a] lg:grid lg:min-h-[480px] lg:grid-cols-[minmax(0,0.5fr)_minmax(0,0.5fr)] lg:items-stretch lg:gap-0">
                    <div
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[length:22px_22px]"
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_40%,rgba(255,255,255,0.05)_0%,transparent_55%)]"
                        aria-hidden
                    />

                    <div className="relative z-10 flex min-h-0 flex-col justify-start p-10 lg:py-14 lg:pl-14 lg:pr-4">
                        <p className="text-sm text-zinc-500">{eyebrow}</p>
                        <h2
                            id={`${id}-heading`}
                            className="mt-4 max-w-[26rem]  text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white lg:text-[3rem]"
                        >
                            {heading}
                        </h2>
                        <p className="mt-5 max-w-full text-base leading-[1.65] text-zinc-400 lg:text-lg">
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

                    <div className="relative z-10 flex min-h-[280px] flex-col overflow-hidden lg:min-h-0 lg:pl-0 lg:pr-14">
                        <div
                            className="relative ml-0 mr-auto min-h-0 w-full flex-1 overflow-hidden"
                            style={{ maxWidth: screenshot.width }}
                        >
                            <div className="absolute inset-0 translate-y-[8%] transition-transform duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:transition-none lg:group-hover:translate-y-[5%] lg:motion-reduce:group-hover:translate-y-0">
                                <Image
                                    src={screenshot.src}
                                    alt={screenshot.alt}
                                    fill
                                    className="object-cover object-top"
                                    sizes={`(max-width: 1024px) 100vw, ${screenshot.width}px`}
                                    priority
                                />
                            </div>
                            <div
                                className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-[#0a0a0a] from-1% via-[#0a0a0a]/15 to-transparent sm:h-28 lg:h-36"
                                aria-hidden
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

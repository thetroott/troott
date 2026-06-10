import { audienceStoryContent } from '@/_data/troott/audience-story';

import { AudienceStoryHeadline } from './AudienceStoryHeadline';

export function AudienceStorySection() {
    const content = audienceStoryContent;

    return (
        <section
            id="audience-story"
            aria-labelledby="audience-story-heading"
            className="bg-background py-24 sm:py-32 lg:py-40"
        >
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="mx-auto max-w-[720px] text-center">
                    <AudienceStoryHeadline
                        id="audience-story-heading"
                        segments={content.headline}
                    />
                    <p className="mt-5 text-base leading-normal text-zinc-400 md:text-lg">
                        {content.subtext}
                    </p>
                    <ul
                        className="mt-8 flex flex-wrap items-center justify-center gap-2.5 md:gap-3"
                        aria-label="Who uses Troott"
                    >
                        {content.audienceTags.map((tag) => (
                            <li
                                key={tag}
                                className="rounded-full bg-[#262626] px-4 py-2 text-sm font-medium text-zinc-300"
                            >
                                {tag}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

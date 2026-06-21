import { audienceStoryContent } from '@/_data/troott/audience-story';
import { cx } from '@/lib/utils';

import { AudienceStoryHeadline } from './AudienceStoryHeadline';

type AudienceStorySectionProps = {
    className?: string;
};

export function AudienceStorySection({ className }: AudienceStorySectionProps) {
    const content = audienceStoryContent;

    return (
        <section
            id="audience-story"
            aria-labelledby="audience-story-heading"
            className={cx('bg-background pt-16 pb-6 sm:pt-20 sm:pb-8', className)}
        >
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="mx-auto  max-w-5xl text-center">
                    <AudienceStoryHeadline
                        id="audience-story-heading"
                        segments={content.headline}
                    />
                    <p className="mt-5 text-base leading-normal text-zinc-400 md:text-lg">
                        {content.subtext}
                    </p>
                    <ul
                        className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 md:gap-3"
                        aria-label="Who uses Troott"
                    >
                        {content.audienceTags.map((tag, index) => (
                            <li
                                key={tag}
                                className={cx(
                                    'rounded-full bg-[#262626] px-3 py-1 text-xs font-medium text-zinc-300 sm:px-4 sm:py-2 sm:text-sm',
                                    index >= 3 && 'max-md:hidden',
                                )}
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

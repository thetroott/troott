import Image from 'next/image';

import type { HeadlineSegment } from '@/_data/troott/audience-story';

export function AudienceStoryHeadline({
    id,
    segments,
}: {
    id: string;
    segments: HeadlineSegment[];
}) {
    return (
        <h2
            id={id}
            className="text-2xl font-bold leading-[1.15] tracking-[-0.02em] text-white md:text-4xl lg:text-5xl"
        >
            {segments.map((segment, index) => {
                if (segment.type === 'text') {
                    return <span key={index}>{segment.value}</span>;
                }

                if (segment.type === 'emoji') {
                    return (
                        <span
                            key={index}
                            className="mx-1 inline align-middle"
                            aria-hidden="true"
                        >
                            {segment.value}
                        </span>
                    );
                }

                return (
                    <span
                        key={index}
                        className="relative mx-1.5 inline-block h-8 w-8 sm:h-14 sm:w-14 shrink-0 align-middle overflow-hidden "
                    >
                        <Image
                            src={segment.src}
                            alt={segment.alt}
                            fill
                            className="object-c"
                            sizes="112px"
                        />
                    </span>
                );
            })}
        </h2>
    );
}

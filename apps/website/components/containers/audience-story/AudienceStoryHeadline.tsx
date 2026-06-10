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
            className="text-[2.25rem] font-bold leading-[1.15] tracking-[-0.02em] text-white md:text-5xl lg:text-[3.5rem]"
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
                        className="relative mx-1.5 inline-block h-10 w-[5.5rem] shrink-0 align-middle overflow-hidden rounded-full ring-1 ring-white/10 md:h-12 md:w-28"
                    >
                        <Image
                            src={segment.src}
                            alt={segment.alt}
                            fill
                            className="object-cover"
                            sizes="112px"
                        />
                    </span>
                );
            })}
        </h2>
    );
}

import type { SectionIntroContent } from '@/_data/troott/section-intro';
import { cx } from '@/lib/utils';

export type SectionIntroSectionProps = {
    content: SectionIntroContent;
    className?: string;
};

export function SectionIntroSection({
    content,
    className,
}: SectionIntroSectionProps) {
    const { id = 'section-intro', label, heading, headingMuted } = content;

    return (
        <section
            id={id}
            aria-labelledby={`${id}-heading`}
            className={cx('w-full bg-Background pt-20 sm:pt-28 pb-0', className)}

        >
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <p className="font-mono text-[13px] leading-none text-zinc-500">
                    {label}
                </p>
                <h2
                    id={`${id}-heading`}
                    className="mt-5 text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.5rem]"
                >
                    <span className="block">{heading}</span>
                    <span className="block text-zinc-500">{headingMuted}</span>
                </h2>
            </div>
        </section>
    );
}

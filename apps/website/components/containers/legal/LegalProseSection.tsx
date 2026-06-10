import type { LegalSection } from '@/_data/legal/types';

type LegalProseSectionProps = {
    id: string;
    sectionId: string;
    titleId: string;
    section: LegalSection;
};

export function LegalProseSection({
    id,
    sectionId,
    titleId,
    section,
}: LegalProseSectionProps) {
    return (
        <section
            id={id}
            data-section-id={sectionId}
            aria-labelledby={titleId}
            className="scroll-mt-[calc(var(--site-header-height,4rem)+1.5rem)]"
        >
            {section.eyebrow ? (
                <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                    {section.eyebrow}
                </p>
            ) : null}
            <h2
                id={titleId}
                className="mt-4 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-[1.875rem]"
            >
                {section.title}
            </h2>
            <div
                className="mt-5 text-[15px] leading-[1.65] text-zinc-400 sm:text-base sm:leading-[1.7] [&_a]:text-teal-400 [&_a]:underline [&_li]:ml-4 [&_ol]:list-decimal [&_p+p]:mt-4 [&_ul]:list-disc"
                dangerouslySetInnerHTML={{ __html: section.body }}
            />
        </section>
    );
}

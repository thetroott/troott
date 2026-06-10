'use client';

import { useRef } from 'react';

import type { LegalHubContent } from '@/_data/legal/types';
import { ScrollspyLayout } from '@/components/shared/scrollspy';

import { LegalBreadcrumbs } from './LegalBreadcrumbs';
import { LegalDocSwitcher } from './LegalDocSwitcher';
import { LegalPageHeader } from './LegalPageHeader';
import { LegalProseSection } from './LegalProseSection';
import { legalSectionDomId } from './legal-dom';

type LegalHubPageProps = {
    hub: LegalHubContent;
};

export function LegalHubPage({ hub }: LegalHubPageProps) {
    const sectionsRef = useRef<HTMLDivElement>(null);

    const header = (
        <>
            <LegalBreadcrumbs audience={hub.audience} />
            <LegalPageHeader
                heading={hub.heading}
                headingMuted={hub.headingMuted}
                className="mt-5"
            />
        </>
    );

    const nav = <LegalDocSwitcher audience={hub.audience} />;

    return (
        <ScrollspyLayout
            header={header}
            nav={nav}
            sectionsRef={sectionsRef}
            navLabel={`${hub.audience} legal documents`}
        >
            <p className="text-[15px] leading-[1.65] text-zinc-400 sm:text-base sm:leading-[1.7]">
                {hub.intro}
            </p>
            {hub.sections.map((section) => {
                const domId = legalSectionDomId(section.id);
                return (
                    <LegalProseSection
                        key={section.id}
                        id={domId}
                        sectionId={section.id}
                        titleId={`${domId}-title`}
                        section={section}
                    />
                );
            })}
        </ScrollspyLayout>
    );
}

'use client';

import { getLegalDocNav } from '@/_data/legal/documents';
import type { LegalAudience, LegalDocument } from '@/_data/legal/types';
import { ScrollspyLayout, useScrollspy } from '@/components/shared/scrollspy';

import { LegalBreadcrumbs } from './LegalBreadcrumbs';
import { LegalSectionNav } from './LegalDocSwitcher';
import { LegalProseSection } from './LegalProseSection';
import { legalSectionDomId } from './legal-dom';

type LegalDocumentPageProps = {
    document: LegalDocument;
    audience: LegalAudience;
};

export function LegalDocumentPage({ document, audience }: LegalDocumentPageProps) {
    const sectionIds = document.sections.map((section) => section.id);
    const { activeSectionId, scrollToSection, sectionsRef } = useScrollspy({
        defaultSectionId: sectionIds[0]!,
        sectionIds,
        domIdForSection: legalSectionDomId,
    });

    const docTitle =
        getLegalDocNav(audience).find((item) => item.slug === document.slug)
            ?.navLabel ?? document.slug;

    const header = (
        <LegalBreadcrumbs audience={audience} documentTitle={docTitle} />
    );

    const nav = (
        <LegalSectionNav
            sections={document.sections}
            activeSectionId={activeSectionId}
            onNavigate={scrollToSection}
            domIdForSection={legalSectionDomId}
        />
    );

    return (
        <ScrollspyLayout
            header={header}
            nav={nav}
            sectionsRef={sectionsRef}
            navLabel="In this document"
        >
            {document.sections.map((section) => {
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

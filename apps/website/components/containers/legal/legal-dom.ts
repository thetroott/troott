import { sectionDomId } from '@/components/shared/scrollspy';

export const LEGAL_SECTION_PREFIX = 'legal-section';

export function legalSectionDomId(sectionId: string): string {
    return sectionDomId(LEGAL_SECTION_PREFIX, sectionId);
}

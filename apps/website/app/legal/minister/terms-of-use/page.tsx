import type { Metadata } from 'next';

import { getLegalDocument } from '@/_data/legal/documents';
import { LegalDocumentPage } from '@/components/containers/legal';

const document = getLegalDocument('minister', 'terms-of-use');

export const metadata: Metadata = {
    title: `${document.heading} | Troott Legal (Minister)`,
    description: document.headingMuted,
};

export default function MinisterTermsPage() {
    return <LegalDocumentPage document={document} audience="minister" />;
}

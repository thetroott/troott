import type { Metadata } from 'next';

import { getLegalDocument } from '@/_data/legal/documents';
import { LegalDocumentPage } from '@/components/containers/legal';

const document = getLegalDocument('listener', 'cookies');

export const metadata: Metadata = {
    title: `${document.heading} | Troott Legal (Listener)`,
    description: document.headingMuted,
};

export default function ListenerCookiesPage() {
    return <LegalDocumentPage document={document} audience="listener" />;
}

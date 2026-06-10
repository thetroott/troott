import type { Metadata } from 'next';

import { getLegalDocument } from '@/_data/legal/documents';
import { LegalDocumentPage } from '@/components/containers/legal';

const document = getLegalDocument('listener', 'gdpr');

export const metadata: Metadata = {
    title: `${document.heading} | Troott Legal (Listener)`,
    description: document.headingMuted,
};

export default function ListenerGdprPage() {
    return <LegalDocumentPage document={document} audience="listener" />;
}

import type { Metadata } from 'next';

import { LegalAudiencePage } from '@/components/containers/legal';

export const metadata: Metadata = {
    title: 'Legal | Troott',
    description: 'Choose listener or minister legal documents for Troott.',
};

export default function LegalPage() {
    return <LegalAudiencePage />;
}

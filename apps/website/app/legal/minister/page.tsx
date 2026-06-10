import type { Metadata } from 'next';

import { getLegalHub } from '@/_data/legal/documents';
import { LegalHubPage } from '@/components/containers/legal';

const hub = getLegalHub('minister');

export const metadata: Metadata = {
    title: `${hub.heading} | Troott Legal (Minister)`,
    description: hub.intro,
};

export default function MinisterLegalHubPage() {
    return <LegalHubPage hub={hub} />;
}

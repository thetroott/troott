import type { Metadata } from 'next';

import { getLegalHub } from '@/_data/legal/documents';
import { LegalHubPage } from '@/components/containers/legal';

const hub = getLegalHub('listener');

export const metadata: Metadata = {
    title: `${hub.heading} | Troott Legal (Listener)`,
    description: hub.intro,
};

export default function ListenerLegalHubPage() {
    return <LegalHubPage hub={hub} />;
}

import type { Metadata } from 'next';

import { listenerLandingContent } from '@/_data/troott/audience-landing';
import { AudienceLandingPage } from '@/components/containers/audience-landing';

export const metadata: Metadata = {
    title: listenerLandingContent.metadata.title,
    description: listenerLandingContent.metadata.description,
};

export default function ListenerPage() {
    return (
        <main className="flex flex-col">
            <AudienceLandingPage content={listenerLandingContent} />
        </main>
    );
}

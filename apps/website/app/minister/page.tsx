import type { Metadata } from 'next';

import { ministerLandingContent } from '@/_data/troott/audience-landing';
import { AudienceLandingPage } from '@/components/containers/audience-landing';

export const metadata: Metadata = {
    title: ministerLandingContent.metadata.title,
    description: ministerLandingContent.metadata.description,
};

export default function MinisterPage() {
    return (
        <main className="flex flex-col">
            <AudienceLandingPage content={ministerLandingContent} />
        </main>
    );
}

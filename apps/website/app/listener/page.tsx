import type { Metadata } from 'next';

import { listenerLandingContent } from '@/_data/troott/audience-landing';
import { AudienceLandingPage } from '@/components/containers/audience-landing';
import { BenefitsSection } from '@/components/containers/benefits/BenefitsSection';
import { AudienceStorySection } from '@/components/containers/audience-story';
import { FeatureHighlightSection } from '@/components/containers/feature-highlight/FeatureHighlightSection';
import { AppShowcaseSection } from '@/components/containers/app-showcase';
import { FaqsSection } from '@/components/containers/faqs/FaqsSection';

export const metadata: Metadata = {
    title: listenerLandingContent.metadata.title,
    description: listenerLandingContent.metadata.description,
};

export default function ListenerPage() {
    return (
        <main className="flex flex-col">
            <AudienceLandingPage content={listenerLandingContent} />
            <AudienceStorySection />

            <FeatureHighlightSection />

            <AppShowcaseSection />
            <BenefitsSection/>

            <FaqsSection />
        </main>
    );
}

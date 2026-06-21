import type { Metadata } from 'next';

import {
    listenerHeroContent,
    listenerLandingContent,
} from '@/_data/troott/audience-landing';
import { AudienceLandingPage } from '@/components/containers/audience-landing';
import HeroSection from '@/components/containers/HeroSection';
import { BenefitsSection } from '@/components/containers/benefits/BenefitsSection';
import { AudienceStorySection } from '@/components/containers/audience-story';
import { featureHighlightContent } from '@/_data/troott/feature-highlight';
import { FeatureHighlightSection } from '@/components/containers/feature-highlight';
import { AppShowcaseSection } from '@/components/containers/app-showcase';
import { FaqsSection } from '@/components/containers/faqs/FaqsSection';

export const metadata: Metadata = {
    title: listenerLandingContent.metadata.title,
    description: listenerLandingContent.metadata.description,
};

export default function ListenerPage() {
    return (
        <main className="flex flex-col">
            <HeroSection content={listenerHeroContent} />
            <AudienceLandingPage
                content={listenerLandingContent}
                showHero={false}
            />
            <AudienceStorySection />

            <FeatureHighlightSection content={featureHighlightContent} />

            <AppShowcaseSection />
            <BenefitsSection/>

            <FaqsSection />
        </main>
    );
}

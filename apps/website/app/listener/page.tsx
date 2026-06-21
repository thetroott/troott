import type { Metadata } from 'next';

import {
    listenerHeroContent,
    listenerLandingContent,
} from '@/_data/troott/audience-landing';
import HeroSection from '@/components/containers/HeroSection';
import { BenefitsSection } from '@/components/containers/benefits/BenefitsSection';
import { AudienceStorySection } from '@/components/containers/audience-story';
import {
    listenerFeatureHighlightDiscoverContent,
    listenerFeatureHighlightListenContent,
    listenerFeatureHighlightSeriesContent,
    listenerFeatureHighlightShareContent,
} from '@/_data/troott/feature-highlight';
import { FeatureHighlightSection } from '@/components/containers/feature-highlight';
import { AppShowcaseSection } from '@/components/containers/app-showcase';
import { FaqsSection } from '@/components/containers/faqs/FaqsSection';
import { whyTroottIntroContent } from '@/_data/troott/section-intro';
import { SectionIntroSection } from '@/components/containers/section-intro';

export const metadata: Metadata = {
    title: listenerLandingContent.metadata.title,
    description: listenerLandingContent.metadata.description,
};

export default function ListenerPage() {
    return (
        <main className="flex flex-col">
            <HeroSection content={listenerHeroContent} />

            <AudienceStorySection />

            <AppShowcaseSection />
            
            <SectionIntroSection content={whyTroottIntroContent} />
            <FeatureHighlightSection
                content={listenerFeatureHighlightDiscoverContent}
                imagePosition="left"
            />
            <FeatureHighlightSection
                content={listenerFeatureHighlightListenContent}
                imagePosition="right"
            />

            <FeatureHighlightSection
                content={listenerFeatureHighlightShareContent}
                imagePosition="left"
            />

            <FeatureHighlightSection
                content={listenerFeatureHighlightSeriesContent}
                imagePosition="right"
            />

            <BenefitsSection />

            <FaqsSection />
        </main>
    );
}

import {
    listenerFeatureHighlightDiscoverContent,
    listenerFeatureHighlightListenContent,
    listenerFeatureHighlightShareContent,
} from '@/_data/troott/feature-highlight';
import { FeatureHighlightSection } from '@/components/containers/feature-highlight';

import HeroSection from '@/components/containers/HeroSection';
import { homeHeroContent } from '@/_data/troott/audience-landing';
import { WhyTroottTabsSection } from '@/components/containers/why-troott-tabs/WhyTroottTabsSection';
import { ProductWorkflowsSection } from '@/components/containers/product-workflows';

import { WhyTroottSection } from '@/components/containers/why-troott';
import { SectionIntroSection } from '@/components/containers/section-intro';
import { whyTroottIntroContent } from '@/_data/troott/section-intro';

export default function Home() {
    return (
        <main className="flex flex-col">
            <HeroSection content={homeHeroContent} />
            {/* <LogoCloudSection /> */}

            {/* <FeaturedPartnersSection /> */}

            <WhyTroottSection />

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

            {/* <WhyTroottTabsSection /> */}

            <ProductWorkflowsSection />

            {/* <CoreFeaturesSection {...coreFeaturesContent} /> */}
            {/* 
            <TextSection />

            <Mission /> */}

            {/* <Faqs />
            <CTASection /> */}
        </main>
    );
}

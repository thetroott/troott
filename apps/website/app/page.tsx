import { getStartedContent } from '@/_data/troott/get-started';
import { coreFeaturesContent } from '@/_data/troott/core-features';
import CTASection from '@/components/containers/CallToAction';
import { CoreFeaturesSection } from '@/components/containers/feature-showcase';
import { AppShowcaseSection } from '@/components/containers/app-showcase';
import { AudienceStorySection } from '@/components/containers/audience-story';
import { BenefitsSection } from '@/components/containers/benefits/BenefitsSection';
import { FaqsSection } from '@/components/containers/faqs/FaqsSection';
import {
    featureHighlightContent,
    featureHighlightStudioContent,
} from '@/_data/troott/feature-highlight';
import { FeatureHighlightSection } from '@/components/containers/feature-highlight';
import { ProductWorkflowsSection } from '@/components/containers/product-workflows';
import { Faqs } from '@/components/containers/Faqs';
import HeroSection from '@/components/containers/HeroSection';
import { homeHeroContent } from '@/_data/troott/audience-landing';
import { FeaturedPartnersSection } from '@/components/containers/featured-partners';
import { WhyTroottTabsSection } from '@/components/containers/why-troott-tabs/WhyTroottTabsSection';
// import { LogoCloudSection } from '@/components/containers/logo-cloud';
import Mission from '@/components/containers/Mission';
import { SplitDemoSection } from '@/components/containers/split-demo';
import TextSection from '@/components/containers/TextSection';

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
                content={featureHighlightContent}
                imagePosition="left"
            />
            <FeatureHighlightSection
                content={featureHighlightStudioContent}
                imagePosition="right"
            />

            <FeatureHighlightSection
                content={featureHighlightContent}
                imagePosition="left"
            />

            <WhyTroottTabsSection />

            {/* <CoreFeaturesSection {...coreFeaturesContent} /> */}
            {/* 
            <TextSection />

            <Mission /> */}

            {/* <Faqs />
            <CTASection /> */}
        </main>
    );
}

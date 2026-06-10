import { getStartedContent } from '@/_data/troott/get-started';
import { coreFeaturesContent } from '@/_data/troott/core-features';
import CTASection from '@/components/containers/CallToAction';
import { DownloadsSection } from '@/components/containers/downloads';
import { CoreFeaturesSection } from '@/components/containers/feature-showcase';
import { BenefitsSection } from '@/components/containers/benefits/BenefitsSection';
import { FaqsSection } from '@/components/containers/faqs/FaqsSection';
import { FeatureHighlightSection } from '@/components/containers/feature-highlight/FeatureHighlightSection';
import { Faqs } from '@/components/containers/Faqs';
import HeroSection from '@/components/containers/HeroSection';
import { FeaturedPartnersSection } from '@/components/containers/featured-partners';
import { WhyTroottTabsSection } from '@/components/containers/why-troott-tabs/WhyTroottTabsSection';
// import { LogoCloudSection } from '@/components/containers/logo-cloud';
import Mission from '@/components/containers/Mission';
import { SplitDemoSection } from '@/components/containers/split-demo';
import TextSection from '@/components/containers/TextSection';

import { WhyTroottSection } from '@/components/containers/why-troott';

export default function Home() {
    return (
        <main className="flex flex-col">
            <HeroSection />
            {/* <LogoCloudSection /> */}

            <FeaturedPartnersSection />

            <WhyTroottSection />

            <WhyTroottTabsSection />

            <BenefitsSection />

            <FeatureHighlightSection />

            <CoreFeaturesSection {...coreFeaturesContent} />


            <TextSection />

            <Mission />

            <SplitDemoSection {...getStartedContent} />

            <FaqsSection />

            <Faqs />

            <DownloadsSection />

            <CTASection />
        </main>
    );
}

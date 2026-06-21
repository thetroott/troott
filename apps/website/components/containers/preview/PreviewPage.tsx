import {
    homeHeroContent,
    listenerHeroContent,
    ministerHeroContent,
} from '@/_data/troott/audience-landing';
import { coreFeaturesContent } from '@/_data/troott/core-features';
import {
    featureHighlightContent,
    featureHighlightStudioContent,
    listenerFeatureHighlightDiscoverContent,
    listenerFeatureHighlightListenContent,
    listenerFeatureHighlightShareContent,
} from '@/_data/troott/feature-highlight';
import { getStartedContent } from '@/_data/troott/get-started';
import { ministerBenefitsContent } from '@/_data/troott/minister-benefits';
import { ministerFaqsContent } from '@/_data/troott/minister-faqs';
import {
    ministerProductWorkflowsContent,
    ministerWhyTroottContent,
} from '@/_data/troott/minister-why-troott';
import { whyTroottIntroContent } from '@/_data/troott/section-intro';
import { productWorkflowsContent } from '@/_data/troott/why-troott';
import { AppShowcaseSection } from '@/components/containers/app-showcase';
import { AudienceStorySection } from '@/components/containers/audience-story';
import { BenefitsSection } from '@/components/containers/benefits/BenefitsSection';
import CTASection from '@/components/containers/CallToAction';
import { CoreFeaturesSection } from '@/components/containers/feature-showcase';
import { FaqsSection } from '@/components/containers/faqs/FaqsSection';
import { Faqs } from '@/components/containers/Faqs';
import { FeatureHighlightSection } from '@/components/containers/feature-highlight';
import { FeaturedPartnersSection } from '@/components/containers/featured-partners';
import HeroSection from '@/components/containers/HeroSection';
import { LegalAudiencePage } from '@/components/containers/legal';
import { LogoCloudSection } from '@/components/containers/logo-cloud';
import Mission from '@/components/containers/Mission';
import { NotFoundContent } from '@/components/containers/NotFoundContent';
import { ProductWorkflowsSection } from '@/components/containers/product-workflows';
import { SectionIntroSection } from '@/components/containers/section-intro';
import { SplitDemoSection } from '@/components/containers/split-demo';
import TextSection from '@/components/containers/TextSection';
import { WhyTroottSection } from '@/components/containers/why-troott';
import { WhyTroottTabsSection } from '@/components/containers/why-troott-tabs/WhyTroottTabsSection';

import { PreviewSectionLabel } from './PreviewSectionLabel';

export function PreviewPage() {
    return (
        <main className="flex flex-col">
            <PreviewSectionLabel name="HeroSection — Home" />
            <HeroSection content={homeHeroContent} />

            <PreviewSectionLabel name="LogoCloudSection" />
            <LogoCloudSection />

            <PreviewSectionLabel name="FeaturedPartnersSection" />
            <FeaturedPartnersSection />

            <PreviewSectionLabel name="WhyTroottSection" />
            <WhyTroottSection />

            <PreviewSectionLabel name="SectionIntroSection" />
            <SectionIntroSection content={whyTroottIntroContent} />

            <PreviewSectionLabel name="FeatureHighlightSection — Home (left)" />
            <FeatureHighlightSection
                content={featureHighlightContent}
                imagePosition="left"
            />

            <PreviewSectionLabel name="FeatureHighlightSection — Studio (right)" />
            <FeatureHighlightSection
                content={featureHighlightStudioContent}
                imagePosition="right"
            />

            <PreviewSectionLabel name="WhyTroottTabsSection — Home" />
            <WhyTroottTabsSection />

            <PreviewSectionLabel name="ProductWorkflowsSection — Home" />
            <ProductWorkflowsSection content={productWorkflowsContent} />

            <PreviewSectionLabel name="CoreFeaturesSection" />
            <CoreFeaturesSection {...coreFeaturesContent} />

            <PreviewSectionLabel name="SplitDemoSection" />
            <SplitDemoSection {...getStartedContent} />

            <PreviewSectionLabel name="TextSection" />
            <TextSection />

            <PreviewSectionLabel name="Mission" />
            <Mission />

            <PreviewSectionLabel name="HeroSection — Listener" />
            <HeroSection content={listenerHeroContent} />

            <PreviewSectionLabel name="FeatureHighlightSection — Discover (left)" />
            <FeatureHighlightSection
                content={listenerFeatureHighlightDiscoverContent}
                imagePosition="left"
            />

            <PreviewSectionLabel name="FeatureHighlightSection — Listen (right)" />
            <FeatureHighlightSection
                content={listenerFeatureHighlightListenContent}
                imagePosition="right"
            />

            <PreviewSectionLabel name="FeatureHighlightSection — Share (left)" />
            <FeatureHighlightSection
                content={listenerFeatureHighlightShareContent}
                imagePosition="left"
            />

            <PreviewSectionLabel name="AudienceStorySection" />
            <AudienceStorySection />

            <PreviewSectionLabel name="AppShowcaseSection" />
            <AppShowcaseSection />

            <PreviewSectionLabel name="BenefitsSection — Listener" />
            <BenefitsSection />

            <PreviewSectionLabel name="FaqsSection — Listener" />
            <FaqsSection />

            <PreviewSectionLabel name="HeroSection — Minister" />
            <HeroSection content={ministerHeroContent} />

            <PreviewSectionLabel name="WhyTroottTabsSection — Minister" />
            <WhyTroottTabsSection content={ministerWhyTroottContent} />

            <PreviewSectionLabel name="BenefitsSection — Minister" />
            <BenefitsSection content={ministerBenefitsContent} />

            <PreviewSectionLabel name="ProductWorkflowsSection — Minister" />
            <ProductWorkflowsSection content={ministerProductWorkflowsContent} />

            <PreviewSectionLabel name="FaqsSection — Minister" />
            <FaqsSection content={ministerFaqsContent} />

            <PreviewSectionLabel name="Faqs (legacy)" />
            <Faqs />

            <PreviewSectionLabel name="CTASection" />
            <CTASection />

            <PreviewSectionLabel name="LegalAudiencePage" />
            <LegalAudiencePage />

            <PreviewSectionLabel name="NotFoundContent" />
            <div className="border border-white/10">
                <NotFoundContent />
            </div>
        </main>
    );
}

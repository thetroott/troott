import type { Metadata } from 'next';

import {
    ministerHeroContent,
    ministerLandingContent,
} from '@/_data/troott/audience-landing';
import { ministerBenefitsContent } from '@/_data/troott/minister-benefits';
import { ministerFaqsContent } from '@/_data/troott/minister-faqs';
import {
    ministerProductWorkflowsContent,
    ministerWhyTroottContent,
} from '@/_data/troott/minister-why-troott';
import { AudienceLandingPage } from '@/components/containers/audience-landing';
import HeroSection from '@/components/containers/HeroSection';
import { WhyTroottTabsSection } from '@/components/containers/why-troott-tabs/WhyTroottTabsSection';
import { BenefitsSection } from '@/components/containers/benefits/BenefitsSection';
import { ProductWorkflowsSection } from '@/components/containers/product-workflows';
import { FaqsSection } from '@/components/containers/faqs/FaqsSection';

export const metadata: Metadata = {
    title: ministerLandingContent.metadata.title,
    description: ministerLandingContent.metadata.description,
};

export default function MinisterPage() {
    return (
        <main className="flex flex-col">
            <HeroSection content={ministerHeroContent} />
            {/* <AudienceLandingPage
                content={ministerLandingContent}
                showHero={false}
            /> */}
            <WhyTroottTabsSection content={ministerWhyTroottContent} />
            <BenefitsSection content={ministerBenefitsContent} />
            <ProductWorkflowsSection content={ministerProductWorkflowsContent} />
            <FaqsSection content={ministerFaqsContent} />
        </main>
    );
}

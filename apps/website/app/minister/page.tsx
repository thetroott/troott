import type { Metadata } from 'next';

import { ministerLandingContent } from '@/_data/troott/audience-landing';
import { AudienceLandingPage } from '@/components/containers/audience-landing';
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
            <AudienceLandingPage content={ministerLandingContent} />

            <WhyTroottTabsSection />
            <BenefitsSection/>

            <ProductWorkflowsSection />

            <FaqsSection />
        </main>
    );
}

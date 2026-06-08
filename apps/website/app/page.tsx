import { getStartedContent } from '@/_data/troott/get-started';
import { coreFeaturesContent } from '@/_data/troott/core-features';
import CTASection from '@/components/containers/CallToAction';
import { CoreFeaturesSection } from '@/components/containers/feature-showcase';
import { Faqs } from '@/components/containers/Faqs';
import HeroSection from '@/components/containers/HeroSection';
import Mission from '@/components/containers/Mission';
import { SplitDemoSection } from '@/components/containers/split-demo';
import TextSection from '@/components/containers/TextSection';
import PreText from '@/components/containers/TextSection1';
import { BentoDemo } from '@/components/containers/UserSection';

export default function Home() {
    return (
        <main className="flex flex-col overflow-hidden">
            <HeroSection />

            <CoreFeaturesSection {...coreFeaturesContent} />

            <PreText />

            <BentoDemo />

            <TextSection />

            <Mission />

            <SplitDemoSection {...getStartedContent} />

            <Faqs />

            <CTASection />
        </main>
    );
}

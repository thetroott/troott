import CTASection from "@/components/containers/CallToAction";
import { Faqs } from "@/components/containers/Faqs";
import HeroSection from "@/components/containers/Hero";
import Mission from "@/components/containers/Mission";
import TextSection from "@/components/containers/TextSection";
import PreText from "@/components/containers/TextSection1";
import { BentoDemo } from "@/components/containers/UserSection";




export default function Home() {
  return (
    <main className="flex flex-col overflow-hidden">
      <HeroSection/>
      
      <PreText/>
      
      <BentoDemo  />
      
      <TextSection/>

      <Mission/>
      
      <Faqs/>
      
      <CTASection/>
    </main>
  );
}

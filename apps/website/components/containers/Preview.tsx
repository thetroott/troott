"use client";

import React from "react";
import Image from "next/image";
import { TextReveal } from "../ui/text-reveal";

type FeatureCardProps = {
  title: string;
  text: string;
  image: string;
  imageClass?: string;
  span?: number;
};

type AvatarGroupProps = {
  avatars: string[];
};

const SectionHeader: React.FC = () => (
  <div className="container mx-auto mb-10 text-center lg:mb-20">
    <p className="mb-2 font-bold uppercase text-gray-800 dark:text-gray-200">
      Features
    </p>
    <h2 className="mb-4 text-2xl font-bold lg:text-4xl text-gray-800 dark:text-gray-100">
      Turn your idea into a startup
    </h2>
    <p className="mx-auto max-w-lg text-gray-500 dark:text-gray-400">
      Were constantly trying to express ourselves and actualize our dreams. If you have the opportunity to play
    </p>
  </div>
);

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  text,
  image,
  imageClass = "",
  span = 1,
}) => (
  <div className={`col-span-${span} bg-gray-100/50 overflow-hidden text-center p-6 rounded-md`}>
    <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-gray-100">{title}</h3>
    <p className="mb-0 mx-auto max-w-xs text-base font-normal leading-7 text-gray-500">{text}</p>
    <div className={`relative w-full ${imageClass} mt-4`}>
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 33vw, 100vw"
      />
    </div>
  </div>
);

const AvatarGroup: React.FC<AvatarGroupProps> = ({ avatars }) => (
  <div className="flex justify-center mt-24 -space-x-4">
    {avatars.map((src, i) => (
      <div key={i} className="relative w-12 h-12 rounded-full border-2 border-white hover:z-10 focus:z-10 overflow-hidden">
        <Image
          src={src}
          alt={`user ${i + 1}`}
          fill
          className="object-cover rounded-full"
        />
      </div>
    ))}
  </div>
);

const FooterInfo: React.FC = () => (
  <div className="flex justify-between items-end mt-36">
    <div className="flex gap-2 items-center">
      <Image
        src="https://www.material-tailwind.com/image/mt-logo.svg"
        alt="logo"
        width={24}
        height={24}
      />
      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-tight">
        Material <br /> Tailwind
      </span>
    </div>
    <a href="#" className="text-xs font-bold text-gray-700 dark:text-gray-300">
      material-tailwind.com
    </a>
  </div>
);

export const FeatureSection16: React.FC = () => {
  const avatars: string[] = [
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
  ];

  return (
    <section className="lg:py-28 py-10 px-8">
      <SectionHeader />

      <div className="container mx-auto mb-8 grid grid-cols-1 gap-y-8 lg:grid-cols-3 lg:gap-x-8">
        <FeatureCard
          title="Mix and Match"
          text="We get insulted by others, lose trust for those We get back."
          image="/image/iphone.svg"
          imageClass="aspect-[3/2] relative lg:h-[360px] xl:h-[370px]"
          span={1}
        />

        <FeatureCard
          title="Modular Components"
          text="It becomes harder for us to give others hand. We get our heart by people we love."
          image="/image/laptop 1.svg"
          imageClass="aspect-[3/2] relative lg:h-[380px]"
          span={2}
        />
      </div>

      <div className="container mx-auto grid grid-cols-1 gap-y-8 lg:grid-cols-3 lg:gap-x-8">
        <FeatureCard
          title="Digital Product Design"
          text="Check out our proven methods, guides, and exercises that help make work better, and people happier."
          image="/image/logo-collection.svg"
          imageClass="aspect-[3/2] relative xl:h-[355px]"
          span={2}
        />
          
        <div className="col-span-1 bg-gray-100/50 overflow-hidden text-center p-6 rounded-md">
          <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-gray-100">
           <TextReveal>Join Our Community</TextReveal> 
          </h3>
          <p className="mx-auto max-w-xs text-base font-normal leading-7 text-gray-500">
            The time is now for it to be okay to be great. For being a bright color.
          </p>
          <AvatarGroup avatars={avatars} />
          <FooterInfo />
        </div>
      </div>
    </section>
  );
};

export default FeatureSection16;

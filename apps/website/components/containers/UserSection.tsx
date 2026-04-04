"use client";

import {
  BellIcon,
  LibraryBigIcon,
  Share2Icon,
  UserRoundCheckIcon,
} from "lucide-react";
import { cx } from "@/lib/utils";
import AnimatedBeamMultipleOutputDemo from "../magicui/animated-beam-outputs";
import AnimatedListDemo from "../magicui/animated-list-demo";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { Marquee } from "@/components/magicui/marquee";
import Image from "next/image";

const Icons = {
  playlist: () => (
    <Image
      src="/images/playlist.png"
      alt="Troott Logo"
      width={100}
      height={100}
      unoptimized
      className="absolute top-10 w-full h-full flex justify-end items-end px-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
    />
  ),
};
const files = [
  {
    src: "/images/apst-tolu-agboola.jpg",
    alt: "Apostle Tolu Agboola",
    width: 200,
    height: 200,
  },
  {
    src: "/images/apst-arome-osayi.jpg",
    alt: "Apostle Arome Osayi",
    width: 200,
    height: 200,
  },
  {
    src: "/images/rev-felix-adejumo.jpg",
    alt: "Rev Funke Felix Adejumo",
    width: 200,
    height: 200,
  },
  {
    src: "/images/apostle-jd.jpg",
    alt: `Apostle Jesudamilare "JD" Adesegun-David`,
    width: 200,
    height: 200,
  },
  {
    src: "/images/apst-joshua-selman-.jpg",
    alt: "Apostle Joshua Selman",
    width: 200,
    height: 200,
  },
];

const features = [
  {
    Icon: UserRoundCheckIcon,
    name: "Preachers you love",
    description: "Easy to find preachers, just tap and listen.",
    href: "",
    cta: "",
    className: "col-span-3 lg:col-span-1",
    background: (

      <>
      <Marquee
        pauseOnHover
        className="absolute top-10 h-80 [--duration:10s] "    
        style={{
            maskImage: "linear-gradient(to top, transparent 40%, #000 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, transparent 40%, #000 100%)",
            "--duration": "10s",
          } as React.CSSProperties
        }
      >
        {files
          .filter((f) => f.src)
          .map((f, idx) => (
            <figure
              key={idx}
              className={cx(
                "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
                "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
                "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
              )}
            >
              <Image
                src={f.src as string}
                alt=""
                fill
                className="h-full w-full object-cover "
              />
            </figure>
          ))}
      </Marquee>

      
      </>
      
    ),
  },
  {
    Icon: BellIcon,
    name: "New Sermons",
    description: "Get notified with new sermon updates.",
    href: "",
    cta: "",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedListDemo className="absolute right-2 top-4 h-[300px] w-full scale-75 border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-90" />
    ),
  },
  {
    Icon: Share2Icon,
    name: "Share with loved ones",
    description: "Inspire your friends & family with one tap.",
    href: "",
    cta: "",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedBeamMultipleOutputDemo className="absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
  {
    Icon: LibraryBigIcon,
    name: "Create your playlist",
    description: "Your fave sermons, anytime you want them",
    className: "col-span-3 lg:col-span-1",
    href: "",
    cta: "",
    background: <Icons.playlist />,
  },
];

// className=""

export function BentoDemo() {
  return (
    <div className="mb-10 mx-2 sm:mxsm:mx-12 md:mx-24 lg:mx-96">
      <BentoGrid>
        {features.map((feature, idx) => (
          <BentoCard key={idx} {...feature} />
        ))}
      </BentoGrid>
    </div>
  );
}

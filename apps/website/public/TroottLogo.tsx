import Image from "next/image";
import type { ImageProps } from "next/image";

export const TroottLogo = (props: Omit<ImageProps, "src" | "alt">) => (
  <Image
    src="/images/troott.svg"
    alt="Troott Logo"
    width={10}
    height={10}
    unoptimized
    {...props}
  />
);

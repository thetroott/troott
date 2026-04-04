"use client";

import React, { forwardRef, useRef } from "react";

import { cx } from "@/lib/utils";
import { AnimatedBeam } from "./animated-beam";
import Image from "next/image";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cx(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default function AnimatedBeamMultipleOutputDemo({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cx(
        "relative flex h-[500px] w-full items-center justify-center overflow-hidden p-10",
        className
      )}
      ref={containerRef}
    >
      <div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-10">
        <div className="flex flex-col justify-center">
          <Circle ref={div7Ref}>
            <Icons.user />
          </Circle>
        </div>
        <div className="flex flex-col justify-center">
          <Circle ref={div6Ref} className="size-16">
            <Icons.troott />
          </Circle>
        </div>

        <div className="flex flex-col justify-center gap-2">
          <Circle ref={div1Ref} className="relative">
            <div className="h-10 rounded-full overflow-hidden">
              <Icons.jay />
            </div>
          </Circle>
          <Circle ref={div2Ref}>
            <Icons.shew />
          </Circle>
          <Circle ref={div3Ref}>
            <Icons.fourty />
          </Circle>
          <Circle ref={div4Ref} className="relative">
          <div className="h-10 rounded-full overflow-hidden">
            <Icons.isa />
  
          </div>
          </Circle>
          <Circle ref={div5Ref}>
            <Icons.bave />
          </Circle>
        </div>
      </div>

      {/* AnimatedBeams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div6Ref}
        duration={3}
        gradientStartColor="#2dd4bf"
        gradientStopColor="#2dd4bf"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div6Ref}
        duration={3}
        gradientStartColor="#2dd4bf"
        gradientStopColor="#2dd4bf"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div6Ref}
        duration={3}
        gradientStartColor="#2dd4bf"
        gradientStopColor="#2dd4bf"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={div6Ref}
        duration={3}
        gradientStartColor="#2dd4bf"
        gradientStopColor="#2dd4bf"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div6Ref}
        duration={3}
        gradientStartColor="#2dd4bf"
        gradientStopColor="#2dd4bf"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div7Ref}
        duration={3}
        gradientStartColor="#2dd4bf"
        gradientStopColor="#2dd4bf"
      />
    </div>
  );
}

const Icons = {
  troott: () => (
    <Image
      src="/images/icon.png"
      alt="Troott Logo"
      width={100}
      height={100}
      unoptimized
      className="rounded-full"
    />
  ),
  isa: () => (
    <Image
      src="/images/abubakar-isa.jpg"
      alt=""
      unoptimized
      fill
      className="rounded-full overflow-hidden object-cover"
    />
  ),
  jay: () => (
    <Image
      src="/images/jay-soundo.jpg"
      alt=""
      unoptimized
      fill
      className="object-fill rounded-full overflow-hidden"
    />
  ),
  fourty: () => (
    <Image
      src="/images/fourty-four.jpg"
      alt=""
      width={100}
      height={100}
      unoptimized
      className="object-fill rounded-full overflow-hidden"
    />
  ),
  shew: () => (
    <Image
      src="/images/abenezer-shewaga.jpg"
      alt=""
      width={400}
      height={400}
      unoptimized
      className="object-cover rounded-full overflow-hidden"
    />
  ),
  bave: () => (
    <Image
      src="/images/bave-pictures.jpg"
      alt="Troott Logo"
      width={200}
      height={200}
      unoptimized
      className="rounded-full object-cover overflow-hidden"
    />
  ),

  user: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#000000"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

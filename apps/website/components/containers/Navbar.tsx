"use client";

import { siteConfig } from "@/app/siteConfig";
import useScroll from "@/lib/useScroll";
import { cx } from "@/lib/utils";
import {
  RiCloseLine,
  RiMenuLine,
  RiPlayCircleFill,
  RiUploadCloudFill,
  RiTwitterXLine,
  RiLinkedinLine,
} from "@remixicon/react";
import { track } from '@vercel/analytics';
import Link from "next/link";
import React from "react";
import { TroottLogo } from "@/public/TroottLogo";
import { Button } from "../Button";
import MobileLink from "./MobileLink";
import Newsletter from "../NewsletterModal";

export function Navigation() {
  const scrolled = useScroll(15);
  const [open, setOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [role, setRole] = React.useState<"listener" | "preacher">("listener");

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleMediaQueryChange = () => {
      setOpen(false);
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);
    handleMediaQueryChange();

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  return (
    <>
      {/* Main Navbar */}
      <header
        className={cx(
          "fixed inset-x-3 top-4 z-50 mx-auto flex max-w-6xl transform-gpu animate-slide-down-fade justify-center overflow-hidden rounded-xl border border-transparent px-3 py-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1.03)] will-change-transform",
          "h-16", // fixed height
          scrolled || open
            ? "backdrop-blur-nav max-w-3xl border-gray-100 bg-white/80 shadow-xl shadow-black/5 dark:border-white/15 dark:bg-black/70"
            : "bg-white/0 dark:bg-gray-950/0"
        )}
      >
        <div className="w-full md:my-auto">
          <div className="relative flex items-center justify-between">
            <Link href={siteConfig.baseLinks.home} aria-label="Home">
              <span className="sr-only">Company logo</span>
              <TroottLogo className="w-28 md:w-32" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:absolute md:left-1/2 md:top-1/2 md:block md:-translate-x-1/2 md:-translate-y-1/2 md:transform">
              <div className="flex items-center gap-10 font-medium">
                <Link
                  className="px-2 py-1"
                  href={siteConfig.baseLinks.listeners}
                >
                  Listeners
                </Link>
                <Link
                  className="px-2 py-1"
                  href={siteConfig.baseLinks.preachers}
                >
                  Preachers
                </Link>
                <Link className="px-2 py-1" href={siteConfig.baseLinks.faqs}>
                  Faqs
                </Link>
              </div>
            </nav>

            {/* Desktop CTA */}
            <Button
              onClick={() => {
                setRole("listener");
                track('listenerSignup');
                setDialogOpen(true);
              }}
              className="hidden h-10 font-semibold md:flex"
            >
              Start listening
            </Button>

            {/* Mobile Buttons */}
            <div className="flex gap-x-2 md:hidden">
              <Button
                onClick={() => setOpen(!open)}
                variant="light"
                className="aspect-square p-2"
              >
                {open ? (
                  <RiCloseLine aria-hidden="true" className="size-5" />
                ) : (
                  <RiMenuLine aria-hidden="true" className="size-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Menu */}
      {open && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-black flex flex-col justify-center px-6 text-xl font-semibold  md:hidden">
          <div className="space-y-1 divide-y divide-teal-100 dark:divide-teal-800 mt-36">
            <MobileLink
              href={siteConfig.baseLinks.listeners}
              onClick={() => setOpen(false)}
            >
              Listeners
            </MobileLink>
            <MobileLink
              href={siteConfig.baseLinks.preachers}
              onClick={() => setOpen(false)}
            >
              Preachers
            </MobileLink>
            <MobileLink
              href={siteConfig.baseLinks.faqs}
              onClick={() => setOpen(false)}
            >
              Faqs
            </MobileLink>
          </div>

          <div className="mt-8">
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 px-3 animate-slide-up-fade"
              style={{ animationDuration: "1100ms" }}
            >
              <Button
                className="h-14 px-8 group gap-x-2 font-semibold text-base md:h-12 md:px-6 md:text-sm w-full sm:w-auto"
                onClick={() => {
                  setRole("listener");
                  setDialogOpen(true);
                }}
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-gray-50 transition-all group-hover:bg-gray-200 dark:bg-gray-800 dark:group-hover:bg-gray-700">
                  <RiPlayCircleFill
                    aria-hidden="true"
                    className="size-4 shrink-0 text-gray-900 dark:text-gray-50"
                  />
                </span>
                Start listening
              </Button>

              <Button
                onClick={() => {
                  setRole("preacher");
                  setDialogOpen(true);
                }}
                variant="secondary"
                className="h-14 px-8 md:h-12 md:px-6 group gap-x-2 bg-transparent font-semibold hover:bg-transparent dark:bg-transparent hover:dark:bg-transparent w-full sm:w-auto"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-gray-50 transition-all group-hover:bg-gray-200 dark:bg-gray-800 dark:group-hover:bg-gray-700">
                  <RiUploadCloudFill
                    aria-hidden="true"
                    className="size-4 shrink-0 text-gray-900 dark:text-gray-50"
                  />
                </span>
                Upload your sermons
              </Button>
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="mt-auto flex items-center justify-between px-3 py-6 text-sm text-gray-500 dark:text-gray-400">
            <span>© Troott</span>

            <div className="flex gap-3">
              <Link
                href="https://x.com/troott"
                target="_blank"
                className="size-9 flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <RiTwitterXLine className="size-4 text-gray-700 dark:text-gray-200" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                className="size-9 flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <RiLinkedinLine className="size-4 text-gray-700 dark:text-gray-200" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <Newsletter
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user_type={role}
      />
    </>
  );
}

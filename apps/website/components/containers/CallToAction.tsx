"use client";
import { RiPlayCircleFill, RiUploadCloudFill } from "@remixicon/react";
import { track } from '@vercel/analytics';
import { Button } from "../Button";
import { useState } from "react";
import Newsletter from "../NewsletterModal";

export default function CTASection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [role, setRole] = useState<"listener" | "preacher">("listener");

  return (
    <section
      aria-labelledby="hero-title"
      className="mt-32 flex flex-col items-center justify-center text-center sm:mt-40"
    >
      <h1
        id="hero-title"
        className="inline-block animate-slide-up-fade bg-gradient-to-br from-neutral-900 to-neutral-800 bg-clip-text p-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-7xl dark:from-gray-50 dark:to-gray-300"
        style={{ animationDuration: "700ms" }}
      >
        Hundreds of sermons <br /> are waiting for you.
      </h1>
      <p
        className="mt-6 max-w-xl animate-slide-up-fade text-lg text-gray-700 dark:text-gray-400"
        style={{ animationDuration: "900ms" }}
      >
        Join thousands who are ready to use sermons on troott to fellowship and
        grow their faith all week long. Click to get early access!
      </p>
      <div
        className="mt-8 flex w-full animate-slide-up-fade flex-col justify-center gap-3 px-3 sm:flex-row"
        style={{ animationDuration: "1100ms" }}
      >
        <Button
          className="h-14 px-8 group gap-x-2 font-semibold md:h-12 md:px-6 text-base md:text-sm"
          onClick={() => {
            setRole("listener");
            track('listenerSignup');
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
          variant="secondary"
          className="h-14 px-8 md:h-12 md:px-6 group gap-x-2 bg-transparent font-semibold hover:bg-transparent dark:bg-transparent hover:dark:bg-transparent"
          onClick={() => {
            setRole("preacher");
            track('preacherSignup');
            setDialogOpen(true);
          }}
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
      <Newsletter open={dialogOpen} onOpenChange={setDialogOpen} user_type={role}/>
    </section>
  );
}

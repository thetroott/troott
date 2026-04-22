"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import OnboardingItems from "@/_data/onboarding";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "onboarding_progress";

const GetStarted = () => {
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCompletedSteps(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedSteps));
  }, [completedSteps]);

  const handleStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps((prev) => [...prev, stepId]);
    }
  };

  const progressPercentage =
    (completedSteps.length / OnboardingItems.length) * 100;

  return (
    <div className="p-20">
      <div className="space-y-6 p-15 border border-border rounded-md">
        {/* Header Section */}

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Get Started</h1>

          {/** Progress Bar */}

          <div className="flex items-center gap-4 text-sm text-muted-foreground w-full max-w-md">
            <span className="whitespace-nowrap">
              {completedSteps.length}/{OnboardingItems.length} completed
            </span>

            <div className="flex-1 bg-neutral-400/60 rounded-full h-2 w-full">
              <div
                className="bg-primary  text-amber-200  h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Onboarding Steps */}
        <div className="space-y-4 ">
          <h2 className="text-xl font-semibold">Launch your first sermon</h2>

          <p className="text-muted-foreground">
            Add the required information to verify your account and avoid
            interruptions to sermon publishing.
          </p>

          <Accordion
            type="single"
            collapsible
            className="w-full space-y-2 mt-12"
          >
            {OnboardingItems.map((item) => (
              <AccordionItem
                value={item.id}
                key={item.id}
                className={cn(
                  "has-focus-visible:border-ring has-focus-visible:ring-ring/50 rounded-md border px-6 outline-none last:border-b has-focus-visible:ring-[3px] transition-colors",
                  "data-[state=open]:bg-accent"
                )}
              >
                <AccordionTrigger>
                  <div className="flex items-center justify-between w-full gap-4 cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <item.icon
                        size={24}
                        className="opacity-60 text-muted-foreground"
                      />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          completedSteps.includes(item.id) &&
                            "text-muted-foreground"
                        )}
                      >
                        {item.title}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent toggle
                        navigate(item.action as string);
                      }}
                      className="group-data-[state=open]:hidden cursor-pointer"
                    >
                      {item.button}
                    </Button>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="text-muted-foreground pb-4 px-9">
                  <hr className="border-border mb-4" />

                  <p className="mb-4">{item.text}</p>

                  <Button
                    onClick={() => {
                      handleStepComplete(item.id);
                      navigate(item.action as string);
                    }}
                    disabled={completedSteps.includes(item.id)}
                    className="text-sm cursor-pointer"
                  >
                    {completedSteps.includes(item.id)
                      ? "Completed"
                      : item.button}
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;

import * as ProgressPrimitive from "@rn-primitives/progress";
import { cn } from "@/lib/utils";
import React from "react";

export const Progress = {
  Root: ({
    className,
    value = 0,
    max = 100,
    children,
    ...props
  }: ProgressPrimitive.RootProps & { className?: string }) => (
    <ProgressPrimitive.Root
      value={value}
      max={max}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      {children ?? (
        <ProgressPrimitive.Indicator
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(100, Math.max(0, (Number(value) / Number(max)) * 100))}%` }}
        />
      )}
    </ProgressPrimitive.Root>
  ),
  Indicator: ({
    className,
    ...props
  }: ProgressPrimitive.IndicatorProps & { className?: string }) => (
    <ProgressPrimitive.Indicator
      className={cn("h-full rounded-full bg-primary", className)}
      {...props}
    />
  ),
};

export type {
  RootProps as ProgressRootProps,
  IndicatorProps as ProgressIndicatorProps,
} from "@rn-primitives/progress";

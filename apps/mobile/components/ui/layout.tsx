import React from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

const gapClass = {
  "2": "gap-2",
  "3": "gap-3",
  "4": "gap-4",
  "5": "gap-5",
  "6": "gap-6",
  "8": "gap-8",
} as const;

export type StackGap = keyof typeof gapClass;

export interface VStackProps extends ViewProps {
  children: React.ReactNode;
  /** Default gap-5 matches auth forms / Figma stack rhythm */
  gap?: StackGap;
  className?: string;
}

/** Vertical stack (column). Troott / Figma-friendly spacing. */
export function VStack({
  children,
  gap = "5",
  className,
  ...props
}: VStackProps) {
  return (
    <View className={cn("flex-col", gapClass[gap], className)} {...props}>
      {children}
    </View>
  );
}

export type HJustify =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

const justifyMap: Record<HJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

export interface HStackProps extends ViewProps {
  children: React.ReactNode;
  gap?: StackGap;
  justify?: HJustify;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  className?: string;
}

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

/** Horizontal row (flex-row). Replaces legacy StyleSheet `row` patterns. */
export function HStack({
  children,
  gap = "4",
  justify = "start",
  align = "center",
  className,
  ...props
}: HStackProps) {
  return (
    <View
      className={cn(
        "flex-row",
        gapClass[gap],
        justifyMap[justify],
        alignMap[align],
        className,
      )}
      {...props}
    >
      {children}
    </View>
  );
}

export interface ScreenSectionProps extends ViewProps {
  children: React.ReactNode;
  /** Horizontal padding (Figma screen gutter ~16px = px-4) */
  inset?: boolean;
  className?: string;
}

/** Full-width section with consistent horizontal inset. */
export function ScreenSection({
  children,
  inset = true,
  className,
  ...props
}: ScreenSectionProps) {
  return (
    <View className={cn("w-full", inset && "px-4", className)} {...props}>
      {children}
    </View>
  );
}

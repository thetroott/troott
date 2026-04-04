import React from "react";
import { Text } from "react-native";
import { convertRunTimeTicksToSeconds } from "@/engine/utils/runtimeticks";
import { cn } from "@/lib/utils";

type Alignment = "center" | "left" | "right";

export function RunTimeSeconds({
  children,
  color = "white",
  alignment = "center",
  className,
}: {
  children: number;
  color?: string;
  alignment?: Alignment;
  className?: string;
}): JSX.Element {
  const isStandardColor = color === "white" || color === "gray";
  return (
    <Text
      className={cn(
        "font-bold tabular-nums",
        color === "white" && "text-neutral-100",
        color === "gray" && "text-neutral-500",
        alignment === "left" && "text-left",
        alignment === "right" && "text-right",
        alignment === "center" && "text-center",
        className
      )}
      style={!isStandardColor ? { color } : undefined}
    >
      {calculateRunTimeFromSeconds(children)}
    </Text>
  );
}

export function RunTimeTicks({
  children,
  className,
}: {
  children?: number | null;
  className?: string;
}): JSX.Element {
  if (!children) return <Text className={className}>0:00</Text>;
  const time = calculateRunTimeFromTicks(children);
  return (
    <Text className={cn("tabular-nums text-neutral-500", className)}>
      {time}
    </Text>
  );
}

// Helpers
function calculateRunTimeFromSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return (
    (hours !== 0 ? `${pad(hours)}:` : '') +
    (hours !== 0 ? `${pad(minutes)}:` : `${minutes}:`) +
    pad(secs)
  );
}

function calculateRunTimeFromTicks(ticks: number): string {
  const seconds = convertRunTimeTicksToSeconds(ticks);
  return calculateRunTimeFromSeconds(seconds);
}

function pad(num: number) {
  return num >= 10 ? `${num}` : `0${num}`;
}

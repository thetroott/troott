import React from "react";
import {
  Pressable,
  Text as RNText,
  View as RNView,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { cn } from "@/lib/utils";
import type {
  PressableRef,
  SlottablePressableProps,
  SlottableTextProps,
  SlottableViewProps,
  TextRef,
  ViewRef,
} from "../types";

function mergeClassName(a?: string, b?: string) {
  return cn(a, b) || undefined;
}

function mergeStyle(
  a: StyleProp<TextStyle | ViewStyle>,
  b: StyleProp<TextStyle | ViewStyle>,
): StyleProp<TextStyle | ViewStyle> {
  if (a == null) return b ?? undefined;
  if (b == null) return a;
  return [a, b] as StyleProp<TextStyle | ViewStyle>;
}

function cloneWithMergedProps<P extends Record<string, unknown>>(
  child: React.ReactElement<P>,
  incoming: Record<string, unknown>,
): React.ReactElement {
  const cp = child.props as Record<string, unknown>;
  const {
    style: inStyle,
    className: inClass,
    ...incomingRest
  } = incoming as {
    style?: StyleProp<TextStyle | ViewStyle>;
    className?: string;
  };
  return React.cloneElement(child, {
    ...cp,
    ...incomingRest,
    style: mergeStyle(
      cp.style as StyleProp<ViewStyle>,
      inStyle as StyleProp<ViewStyle>,
    ),
    className: mergeClassName(
      cp.className as string | undefined,
      inClass,
    ),
  } as never);
}

const View = React.forwardRef<ViewRef, SlottableViewProps>(
  ({ asChild, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return cloneWithMergedProps(
        children as React.ReactElement<Record<string, unknown>>,
        { ...props, ref },
      );
    }
    return (
      <RNView ref={ref} {...props}>
        {children}
      </RNView>
    );
  },
);
View.displayName = "SlotView";

const Text = React.forwardRef<TextRef, SlottableTextProps>(
  ({ asChild, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return cloneWithMergedProps(
        children as React.ReactElement<Record<string, unknown>>,
        { ...props, ref },
      );
    }
    return (
      <RNText ref={ref} {...props}>
        {children}
      </RNText>
    );
  },
);
Text.displayName = "SlotText";

const PressableSlot = React.forwardRef<PressableRef, SlottablePressableProps>(
  ({ asChild, children, ...props }, ref) => {
    if (asChild) {
      if (!React.isValidElement(children)) {
        if (__DEV__) {
          console.warn("Slot.Pressable asChild expects a single React element child.");
        }
        return null;
      }
      return cloneWithMergedProps(
        children as React.ReactElement<Record<string, unknown>>,
        { ...props, ref },
      );
    }
    return (
      <Pressable ref={ref} {...props}>
        {children}
      </Pressable>
    );
  },
);
PressableSlot.displayName = "SlotPressable";

export { PressableSlot as Pressable, Text, View };

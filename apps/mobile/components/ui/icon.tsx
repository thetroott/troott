import React, { JSX } from "react";
import { cn } from "@/lib/utils";
import { cssInterop } from "nativewind";
import type { ColorValue, StyleProp, ViewStyle } from "react-native";

// Lucide
import type { LucideIcon, LucideProps } from "lucide-react-native";
// Phosphor
// import type { IconProps as PhosphorProps } from "phosphor-react-native";

// Shared props
type BaseProps = {
  size?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

// Overload 1 — Lucide
export function Icon(props: BaseProps & LucideProps & { as: LucideIcon }): JSX.Element;
// Overload 2 — Phosphor
// export function Icon(props: BaseProps & PhosphorProps & { as: React.ComponentType<PhosphorProps> }): JSX.Element;

// Implementation
export function Icon({ as: IconComponent, className, size = 14, ...props }: any) {
  return (
    <IconImpl
      as={IconComponent}
      className={cn("text-foreground", className)}
      size={size}
      {...props}
    />
  );
}

// Internal component with cssInterop
function IconImpl({ as: IconComponent, ...props }: any) {
  return <IconComponent {...props} />;
}

cssInterop(IconImpl, {
  className: {
    target: "style",
    nativeStyleToProp: {
      height: "size",
      width: "size",
    },
  },
});

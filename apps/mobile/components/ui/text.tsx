import {
  FontFamilies,
  Typography,
  theme,
} from "@/constants/theme";
import type {
  FontWeight as NumericFontWeight,
  TypographyVariant,
} from "@/constants/typography.types";
import { cn } from "@/lib/utils";
import { Slot } from "@/lib/rn-primitives/slot";
import type { SlottableTextProps, TextRef } from "@/lib/rn-primitives/types";
import * as React from "react";
import { TextStyle } from "react-native";

type LegacyWeight = keyof typeof theme.typography;
type FontSize = keyof typeof theme.sizes.typography;

const NUMERIC_WEIGHTS: Record<NumericFontWeight, LegacyWeight> = {
  "400": "regular",
  "500": "medium",
  "600": "semiBold",
  "700": "bold",
};

function isNumericWeight(w: unknown): w is NumericFontWeight {
  return w === "400" || w === "500" || w === "600" || w === "700";
}

function getFontFamilyFromWeight(weight: NumericFontWeight): string {
  switch (weight) {
    case "400":
      return FontFamilies.matter.regular;
    case "500":
      return FontFamilies.matter.medium;
    case "600":
      return FontFamilies.matter.semiBold;
    case "700":
      return FontFamilies.matter.bold;
    default:
      return FontFamilies.matter.regular;
  }
}

function getFontFamilyForWeight(
  weight: NumericFontWeight,
  currentFontFamily?: string,
): string {
  if (!currentFontFamily || !String(currentFontFamily).startsWith("Matter")) {
    return getFontFamilyFromWeight(weight);
  }
  return getFontFamilyFromWeight(weight);
}

function legacyVariantStyle(
  size: FontSize,
  weight: LegacyWeight,
  color: string | undefined,
): TextStyle {
  return {
    fontSize: theme.sizes.typography[size],
    fontFamily: theme.typography[weight],
    ...(color != null ? { color } : {}),
  };
}

export const TextClassContext = React.createContext<string | undefined>(
  undefined,
);

export type TextTone =
  | "foreground"
  | "muted"
  | "primary"
  | "onPrimary"
  | "destructive"
  | "card";

const TONE_CLASS: Record<TextTone, string> = {
  foreground: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  onPrimary: "text-primary-foreground",
  destructive: "text-destructive",
  card: "text-card-foreground",
};

export interface TextProps extends SlottableTextProps {
  variant?: TypographyVariant;
  /** Numeric weight overrides variant / pairs with `variant`. Legacy screens use Matter keys with `size`. */
  weight?: NumericFontWeight | LegacyWeight;
  textStyle?: TextStyle;
  color?: string;
  /** Semantic text color (NativeWind tokens). */
  tone?: TextTone;
  /** Legacy: use with `size` when `variant` is omitted */
  size?: FontSize;
  className?: string;
}

const Text = React.forwardRef<TextRef, TextProps>(
  (
    {
      className,
      asChild = false,
      variant,
      weight,
      style,
      size = "sm",
      color,
      tone,
      textStyle,
      children,
      ...props
    },
    ref,
  ) => {
    const textClass = React.useContext(TextClassContext);

    let variantStyle: TextStyle | undefined;
    let weightStyle: TextStyle | undefined;
    let legacyStyle: TextStyle | undefined;

    if (variant) {
      variantStyle = { ...(Typography[variant] as TextStyle) };
      if (weight && isNumericWeight(weight)) {
        weightStyle = {
          fontFamily: getFontFamilyForWeight(
            weight,
            variantStyle.fontFamily as string | undefined,
          ),
          fontWeight: weight,
        };
      } else if (weight && weight in theme.typography) {
        weightStyle = {
          fontFamily: theme.typography[weight as LegacyWeight],
        };
      }
    } else {
      const lw: LegacyWeight =
        weight == null
          ? "regular"
          : isNumericWeight(weight)
            ? NUMERIC_WEIGHTS[weight]
            : (weight as LegacyWeight);
      const resolvedColor =
        color ??
        (tone != null ? undefined : theme.colors.grey[200]);
      legacyStyle = legacyVariantStyle(size, lw, resolvedColor);
    }

    const colorStyle =
      variant && color != null ? ({ color } satisfies TextStyle) : undefined;

    const mergedStyle = [
      variant != null ? variantStyle : legacyStyle,
      variant != null ? weightStyle : undefined,
      colorStyle,
      textStyle,
      style,
    ];

    return (
      <Slot.Text
        ref={ref}
        asChild={asChild}
        className={cn(
          "font-matter text-base text-foreground",
          tone != null ? TONE_CLASS[tone] : null,
          textClass,
          className,
        )}
        style={mergedStyle}
        {...props}
      >
        {children}
      </Slot.Text>
    );
  },
);

Text.displayName = "Text";

export { Text };
export default Text;

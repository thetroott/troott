import { ColorPalette, Typography } from "@/constants/theme";
import { cn } from "@/lib/utils";
import React, { useEffect } from "react";
import {
  Pressable,
  type PressableProps,
  Text as RNText,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const AnimatedText = Animated.createAnimatedComponent(RNText);

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "error"
  | "outline"
  | "ghost";

export type ButtonSize = "default" | "sm" | "lg";

type VariantColorSet = {
  default: string;
  pressed: string;
  disabled: string;
  textDefault: string;
  textDisabled: string;
  textPressed?: string;
  border?: string;
  textDisabledBorder?: string;
};

function getVariantColors(variant: ButtonVariant): VariantColorSet {
  switch (variant) {
    case "primary":
      return {
        default: ColorPalette.primary[500],
        pressed: ColorPalette.primary[600],
        disabled: ColorPalette.neutral[700],
        textDefault: ColorPalette.neutral[800],
        textDisabled: ColorPalette.neutral[400],
      };
    case "secondary":
      return {
        default: ColorPalette.secondary[600],
        pressed: ColorPalette.secondary[700],
        disabled: ColorPalette.neutral[700],
        textDefault: ColorPalette.neutral[0],
        textDisabled: ColorPalette.neutral[400],
      };
    case "tertiary":
      return {
        default: ColorPalette.pillBackground,
        pressed: ColorPalette.neutral[700],
        disabled: "transparent",
        textDefault: ColorPalette.primary[400],
        textPressed: ColorPalette.primary[300],
        textDisabled: ColorPalette.neutral[400],
      };
    case "error":
      return {
        default: ColorPalette.alert[500],
        pressed: ColorPalette.alert[600],
        disabled: ColorPalette.neutral[800],
        textDefault: ColorPalette.neutral[0],
        textPressed: ColorPalette.neutral[0],
        textDisabled: ColorPalette.neutral[500],
      };
    case "outline":
      return {
        default: "rgba(0,0,0,0)",
        pressed: ColorPalette.neutral[800],
        disabled: "rgba(0,0,0,0)",
        border: ColorPalette.neutral[100],
        textDisabledBorder: ColorPalette.neutral[400],
        textDefault: ColorPalette.neutral[100],
        textDisabled: ColorPalette.neutral[400],
      };
    case "ghost":
      return {
        default: ColorPalette.pillBackground,
        pressed: ColorPalette.neutral[700],
        disabled: "transparent",
        textDefault: ColorPalette.neutral[100],
        textDisabled: ColorPalette.neutral[400],
      };
    default:
      return getVariantColors("primary");
  }
}

function LoadingDots({ color }: { color: string }) {
  const dot1 = useSharedValue(1);
  const dot2 = useSharedValue(1);
  const dot3 = useSharedValue(1);

  useEffect(() => {
    const pulse = (v: { value: number }) => {
      v.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        false
      );
    };
    pulse(dot1);
    const t2 = setTimeout(() => pulse(dot2), 133);
    const t3 = setTimeout(() => pulse(dot3), 266);
    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [dot1, dot2, dot3]);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scaleY: dot1.value }],
  }));
  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scaleY: dot2.value }],
  }));
  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scaleY: dot3.value }],
  }));

  return (
    <View className="flex-row items-center gap-1.5">
      <Animated.View
        className="h-2.5 w-2.5 rounded-full"
        style={[{ backgroundColor: color }, dot1Style]}
      />
      <Animated.View
        className="h-2.5 w-2.5 rounded-full"
        style={[{ backgroundColor: color }, dot2Style]}
      />
      <Animated.View
        className="h-2.5 w-2.5 rounded-full"
        style={[{ backgroundColor: color }, dot3Style]}
      />
    </View>
  );
}

export interface ButtonProps
  extends Omit<PressableProps, "style" | "children"> {
  children?: React.ReactNode;
  /** @deprecated Prefer `children`; still supported for existing screens */
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-[50px] px-6",
  sm: "h-[40px] px-4",
  lg: "h-[56px] px-8",
};

export const Button = ({
  children,
  label,
  variant = "primary",
  size = "default",
  loading: loadingProp,
  isLoading,
  disabled = false,
  className,
  containerStyle,
  leftIcon,
  rightIcon,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) => {
  const loading = loadingProp ?? isLoading ?? false;
  const pressProgress = useSharedValue(0);
  const colors = getVariantColors(variant);

  const handlePressIn = (
    e: Parameters<NonNullable<PressableProps["onPressIn"]>>[0]
  ) => {
    pressProgress.value = withTiming(1, { duration: 150 });
    onPressIn?.(e);
  };

  const handlePressOut = (
    e: Parameters<NonNullable<PressableProps["onPressOut"]>>[0]
  ) => {
    pressProgress.value = withTiming(0, { duration: 150 });
    onPressOut?.(e);
  };

  const outlineBorderColor =
    variant === "outline"
      ? disabled || loading
        ? colors.textDisabledBorder
        : colors.border
      : undefined;

  const buttonStyle = useAnimatedStyle(() => {
    if (disabled || loading) {
      return { backgroundColor: colors.disabled };
    }
    return {
      backgroundColor: interpolateColor(
        pressProgress.value,
        [0, 1],
        [colors.default, colors.pressed]
      ),
    };
  }, [disabled, loading, variant]);

  const textStyle = useAnimatedStyle(() => {
    if (disabled || loading) {
      return { color: colors.textDisabled };
    }
    if (variant === "tertiary" || variant === "error") {
      return {
        color: interpolateColor(
          pressProgress.value,
          [0, 1],
          [colors.textDefault, colors.textPressed ?? colors.textDefault]
        ),
      };
    }
    return { color: colors.textDefault };
  }, [disabled, loading, variant]);

  const isDisabled = disabled || loading;
  const body = children ?? (label != null ? label : null);
  const dotColor = loading ? colors.textDisabled : colors.textDefault;
  const borderWidth = variant === "outline" ? 1 : 0;

  // #region agent log
  const mergedClassName = cn(
    "flex-row items-center justify-center gap-2 rounded-xl",
    !className?.includes("absolute") && "w-full",
    sizeClasses[size],
    isDisabled && "opacity-100",
    className
  );
  if (typeof children === "string" && (children === "Create Account" || children === "Log In")) {
    fetch(
      "http://127.0.0.1:7249/ingest/c1282b9f-cd10-4319-9a20-a2bebd074195",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "2680e1",
        },
        body: JSON.stringify({
          sessionId: "2680e1",
          runId: "button",
          hypothesisId: "C",
          location: "button.tsx:Button",
          message: "Button merged className passed to Animated.View",
          data: { mergedClassName, incomingClassName: className },
          timestamp: Date.now(),
        }),
      }
    ).catch(() => {});
  }
  // #endregion

  return (
    <Pressable
      accessibilityRole="button"
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      {...props}
    >
      <Animated.View
        className={mergedClassName}
        style={[
          {
            borderWidth,
            ...(outlineBorderColor != null
              ? { borderColor: outlineBorderColor }
              : {}),
          },
          buttonStyle,
          containerStyle,
        ]}
      >
        {loading ? (
          <LoadingDots color={dotColor} />
        ) : (
          <>
            {leftIcon ? <View>{leftIcon}</View> : null}
            {body != null && typeof body === "string" ? (
              <AnimatedText
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                style={[
                  Typography.buttonSecondary as object,
                  { textAlign: "center" },
                  textStyle,
                ]}
              >
                {body}
              </AnimatedText>
            ) : (
              body
            )}
            {rightIcon ? <View>{rightIcon}</View> : null}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
};

Button.displayName = "Button";

export default Button;

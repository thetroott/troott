import React from "react";
import { View } from "react-native";
import Text from "@/components/ui/text";
import { theme } from "@/constants/theme";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  /** default: centered title bar. playlist: left | title | right (Figma app bar). */
  variant?: "default" | "playlist" | "auth";
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  centerElement?: React.ReactNode;
  className?: string;
}

const BAR =
  "h-14 flex-row items-center border-b border-neutral-800 bg-neutral-950";

/**
 * Troott in-app header (dark). Matches dark shell / Figma Troott frames.
 * @see https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott
 */
const Header = ({
  title,
  variant = "default",
  rightElement,
  leftElement,
  centerElement,
  className,
}: HeaderProps) => {
  const titleColor = theme.colors.white[50];

  if (variant === "playlist") {
    return (
      <View className={cn(BAR, "px-2", className)} accessibilityRole="header">
        <View className="w-11 shrink-0 items-start justify-center">
          {leftElement != null ? leftElement : <View className="h-11 w-11" />}
        </View>
        <View className="min-h-11 min-w-0 flex-1 items-center justify-center px-2">
          {centerElement ?? (
            <Text
              weight="semiBold"
              size="md"
              color={titleColor}
              className="text-center"
              numberOfLines={1}
            >
              {title ?? ""}
            </Text>
          )}
        </View>
        <View className="w-11 shrink-0 items-end justify-center">
          {rightElement != null ? rightElement : <View className="h-11 w-11" />}
        </View>
      </View>
    );
  }

  if (variant === "auth") {
    return (
      <View
        className={cn(
          "h-14 items-center justify-center border-b border-neutral-800 bg-neutral-950",
          className,
        )}
        accessibilityRole="header"
      >
        {centerElement ?? (
          <Text weight="semiBold" size="md" color={titleColor} numberOfLines={1}>
            {title ?? ""}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className={cn(BAR, "px-4", className)} accessibilityRole="header">
      {centerElement ?? (
        <Text weight="semiBold" size="md" color={titleColor} numberOfLines={1}>
          {title ?? ""}
        </Text>
      )}
    </View>
  );
};

export default Header;

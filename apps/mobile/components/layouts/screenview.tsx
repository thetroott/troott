import React from "react";
import { ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cn } from "@/lib/utils";

interface ScreenViewProps {
  children: React.ReactNode;
  screenStyle?: ViewStyle;
  className?: string;
  [key: string]: unknown;
}

const ScreenView = ({
  children,
  screenStyle,
  className,
  ...props
}: ScreenViewProps) => {
  return (
    <SafeAreaView
      className={cn("flex-1 bg-neutral-950 px-4 gap-6", className)}
      style={screenStyle}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
};

export default ScreenView;

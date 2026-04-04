import { ColorPalette } from "@/constants";
import React, { ReactNode } from "react";
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

interface AppContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  padding?: boolean;
  /** dark: Troott app (#171717). light: onboarding / marketing surfaces. */
  appearance?: "dark" | "light";
  edges?: readonly Edge[];
}

/**
 * Legacy layout shell. Prefer ScreenView + NativeWind for new screens.
 * Default appearance is **dark** to match post-NativeWind Troott shell.
 */
const AppContainer = ({
  children,
  scrollable = false,
  style,
  padding = true,
  appearance = "dark",
  edges = ["top"],
}: AppContainerProps) => {
  const ContentWrapper = scrollable ? ScrollView : View;
  const bg =
    appearance === "dark" ? "#171717" : ColorPalette.neutral[0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]} edges={edges}>
      <ContentWrapper
        style={[
          styles.container,
          padding ? { paddingHorizontal: 20 } : { paddingHorizontal: 0 },
          { backgroundColor: bg },
          style,
        ]}
        {...(scrollable && { showsVerticalScrollIndicator: false })}
      >
        {children}
      </ContentWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default AppContainer;

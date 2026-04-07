import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { theme } from "@/constants/theme";
import { Portal } from "./portal";

/**
 * BottomSheetModal component that displays a bottom sheet with gesture handling.
 * It uses React Native Reanimated and Gesture Handler for smooth animations and interactions.
 *
 * @component
 * @example
 * return (
 *   <BottomSheetModal ref={bottomSheetRef} />
 * );
 */
export interface BottomSheetRef {
  open: () => void;
  close: () => void;
}

interface BottomSheetRootProps {
  children?: React.ReactNode;
}

function isNearClosedY(y: number, closedY: number): boolean {
  "worklet";
  return Math.abs(y - closedY) < 1;
}

const BottomSheetModalRoot = forwardRef<BottomSheetRef, BottomSheetRootProps>(
  ({ children }, ref) => {
    const [showSheet, setShowSheet] = React.useState(false);

    const initialHeight = theme.sizes.screen.height * 0.5;
    const finalHeight = theme.sizes.screen.height * 0.9;
    const closedTranslateY = initialHeight + 300;

    const sheetTranslateY = useSharedValue(initialHeight + 200);
    const sheetHeight = useSharedValue(initialHeight);

    const runCloseAnimation = useCallback(() => {
      sheetTranslateY.value = withTiming(closedTranslateY, { duration: 300 });
    }, [closedTranslateY, sheetTranslateY]);

    useImperativeHandle(
      ref,
      () => ({
        open: () => {
          setShowSheet(true);
        },
        close: () => {
          runCloseAnimation();
        },
      }),
      [runCloseAnimation]
    );

    useEffect(() => {
      if (showSheet) {
        sheetTranslateY.value = withTiming(0, { duration: 500 });
      }
    }, [showSheet, sheetTranslateY]);

    useAnimatedReaction(
      () => sheetTranslateY.value,
      (current, previous) => {
        if (
          isNearClosedY(current, closedTranslateY) &&
          previous !== null &&
          !isNearClosedY(previous, closedTranslateY)
        ) {
          sheetHeight.value = withSpring(initialHeight);
          runOnJS(setShowSheet)(false);
        }
      }
    );

    const gesture = Gesture.Pan()
      .onUpdate((event) => {
        if (sheetHeight.value >= finalHeight) {
          if (event.translationY < 0) {
            return;
          }
        }
        if (event.translationY < 0 && sheetHeight.value < finalHeight) {
          sheetHeight.value = Math.abs(event.translationY) + initialHeight;
          return;
        }
        sheetTranslateY.value = event.translationY;
      })
      .onEnd((event) => {
        if (event.translationY > 200) {
          sheetTranslateY.value = withTiming(closedTranslateY, { duration: 300 });
          return;
        }
        if (sheetHeight.value >= finalHeight) {
          if (event.translationY > 0 && event.translationY < 100) {
            sheetTranslateY.value = withTiming(0);
            return;
          }
          if (event.translationY > 0 && event.translationY > 100) {
            sheetTranslateY.value = withTiming(0);
            sheetHeight.value = withTiming(initialHeight);
            return;
          }
        }
        if (
          event.translationY > -100 &&
          event.translationY < 0 &&
          sheetHeight.value < finalHeight
        ) {
          sheetHeight.value = withSpring(initialHeight);
          return;
        }
        if (
          event.translationY < -100 &&
          event.translationY < 0 &&
          sheetHeight.value < finalHeight
        ) {
          sheetHeight.value = withSpring(finalHeight);
          sheetTranslateY.value = withSpring(0);
          return;
        }
        sheetTranslateY.value = withTiming(0);
      });

    const animatedRootStyle = useAnimatedStyle(() => ({
      height: sheetHeight.value,
      transform: [{ translateY: sheetTranslateY.value }],
    }));

    if (!showSheet) {
      return null;
    }

    return (
      <Portal name="bottom-sheet-modal">
        <Pressable style={[styles.overlayContainer]} onPress={runCloseAnimation}>
          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.sheetContainer, animatedRootStyle]}>
              <View style={styles.dragger} />
              {children}
            </Animated.View>
          </GestureDetector>
        </Pressable>
      </Portal>
    );
  }
);

BottomSheetModalRoot.displayName = "BottomSheetModalRoot";

interface SubProps {
  children?: React.ReactNode;
}

function BottomSheetTitle({ children }: SubProps) {
  return <Pressable style={styles.headerContainer}>{children}</Pressable>;
}
BottomSheetTitle.displayName = "BottomSheetTitle";

function BottomSheetContent({ children }: SubProps) {
  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      {children}
    </ScrollView>
  );
}
BottomSheetContent.displayName = "BottomSheetContent";

export const BottomSheetModal = {
  Root: BottomSheetModalRoot,
  Title: BottomSheetTitle,
  Content: BottomSheetContent,
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: theme.colors.grey[900],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: theme.sizes.spacing.lg,
    overflow: "hidden",
  },
  headerContainer: {
    padding: theme.sizes.spacing.md,
    paddingTop: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: theme.colors.grey[700],
  },
  dragger: {
    width: theme.sizes.spacing.xl * 1.5,
    height: 5,
    backgroundColor: theme.colors.grey[500],
    borderRadius: theme.sizes.radius.full,
    alignSelf: "center",
    position: "absolute",
    top: theme.sizes.spacing.md,
  },
  contentContainer: {
    padding: theme.sizes.spacing.md,
    paddingTop: 10,
    paddingBottom: theme.sizes.spacing.xl * 2,
  },
});

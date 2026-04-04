import { Pressable, ScrollView, View } from "react-native";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
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
const BottomSheetModalRoot = forwardRef<BottomSheetRef, BottomSheetRootProps>(
  ({ children }, ref) => {
    const [showSheet, setShowSheet] = React.useState(false);
    useImperativeHandle(
      ref,
      () => {
        return {
          open: () => {
            sheetTranslateY.value = withTiming(0, {
              duration: 300,
            });
            setShowSheet(true);
          },
          close: () => {
            sheetTranslateY.value = withTiming(initialHeight + 300, {
              duration: 300,
            });
            setShowSheet(false);
          },
        };
      },
      []
    );
    useEffect(() => {
      if (showSheet) {
        sheetTranslateY.value = withTiming(0, {
          duration: 500,
        });
        return;
      }
    }, [showSheet]);

    const initialHeight = theme.sizes.screen.height * 0.5;
    const finalHeight = theme.sizes.screen.height * 0.9;
    const sheetTranslateY = useSharedValue(initialHeight + 200);
    const sheetHeight = useSharedValue(initialHeight);
    function handleCloseSheet() {
      "worklet";
      sheetTranslateY.value = withTiming(initialHeight + 300, {
        duration: 300,
      });
    }
    useAnimatedReaction(
      () => sheetTranslateY,
      (curr) => {
        if (curr.value === initialHeight + 300 && showSheet) {
          sheetHeight.value = withSpring(initialHeight);
          runOnJS(setShowSheet)(false);
          return;
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
        // close the modal if the user drags down more than 400px
        if (event.translationY > 200) {
          handleCloseSheet();
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
        <Pressable
          className="flex-1 absolute inset-0 bg-black/70 justify-end"
          onPress={handleCloseSheet}
        >
          <GestureDetector gesture={gesture}>
            <Animated.View style={animatedRootStyle}>
              <View className="bg-neutral-900 rounded-t-[20px] py-6 overflow-hidden">
                <View className="w-12 h-1 bg-neutral-500 rounded-full self-center absolute top-4" />
                {children}
              </View>
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
  return (
    <Pressable className="p-4 pt-4 border-b border-neutral-700">
      {children}
    </Pressable>
  );
}
BottomSheetTitle.displayName = "BottomSheetTitle";

function BottomSheetContent({ children }: SubProps) {
  return (
    <ScrollView>
      <View className="p-4 pt-2 pb-16">{children}</View>
    </ScrollView>
  );
}
BottomSheetContent.displayName = "BottomSheetContent";

export const BottomSheetModal = {
  Root: BottomSheetModalRoot,
  Title: BottomSheetTitle,
  Content: BottomSheetContent,
};


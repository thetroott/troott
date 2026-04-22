import React, { useCallback, useMemo } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { router } from "expo-router";

/**
 * Android wrapper for modal-style screen transitions.
 *
 * Important: never mark a function as a Reanimated `worklet` if it closes over
 * `router` / navigation objects. Worklets serialize their closure; capturing
 * the Expo Router host triggers UI-thread errors (`addListener`, SharedValue).
 */

interface ScreenModalAndroidViewProps {
  children?: React.ReactNode;
}
const ScreenModalAndroidView = ({ children }: ScreenModalAndroidViewProps) => {
  const translateY = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    flex: 1,
  }));

  const goBack = useCallback(() => {
    router.back();
  }, []);

  const closeGesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .onUpdate((event) => {
          if (event.translationY > 0) {
            translateY.value = event.translationY;
          }
        })
        .onEnd((event) => {
          const ty = event.translationY;
          if (ty < 100) {
            translateY.value = withSpring(0);
            return;
          }
          translateY.value = 0;
          goBack();
        }),
    [goBack, translateY],
  );

  return (
    <GestureDetector gesture={closeGesture}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </GestureDetector>
  );
};

export default ScreenModalAndroidView;

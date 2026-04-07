import { StyleSheet, Text, View, Platform, Pressable } from "react-native";
import React from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { router } from "expo-router";

/**
 *
 * @description This is an android wrapper for IOS modal
 * screen/route transitions.
 */

interface ScreenModalAndroidViewProps {
  children?: React.ReactNode;
}
const ScreenModalAndroidView = ({ children }: ScreenModalAndroidViewProps) => {
  const translateY = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    flex: 1
  }));
  const handleBackPress = () => {
    "worklet";
    runOnJS(router.back)();
  };
  const closeGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
         translateY.value = withSpring(event.translationY);
        return;
      }
     
    })
    .onEnd((event) => {
  
      if (event.translationY < 100) {
        translateY.value = withSpring(0);
        return;
      }
      if (event.translationY > 100) {
        handleBackPress();
        return;
      }
    });

  return (
    <GestureDetector gesture={closeGesture}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </GestureDetector>
  );
};

export default ScreenModalAndroidView;

const styles = StyleSheet.create({});

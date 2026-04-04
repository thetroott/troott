import { View } from "react-native";
import React, { useEffect } from "react";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { theme } from "@/constants/theme";

const Loader = () => {
  return (
    <View className="self-center flex-row gap-1 justify-center items-center">
      {[...Array(3).keys()].map((_, index) => {
        const loaderProgress = useSharedValue(0);
        const loaderStyle = useAnimatedStyle(() => ({
          opacity: interpolate(loaderProgress.value, [0, 1], [0.7, 1]),
          width: theme.sizes.spacing.sm,
          height: theme.sizes.spacing.sm,
          borderRadius: theme.sizes.radius.full,
          backgroundColor: theme.colors.grey[300],
          transform: [
            {
              scale: interpolate(loaderProgress.value, [0, 1], [0.7, 1]),
            },
          ],
        }));
        useEffect(() => {
          loaderProgress.value = withRepeat(
            withTiming(1, { duration: 400 }),
            -1,
            true
          );
        }, []);
        return <Animated.View style={loaderStyle} key={"loader" + index} />;
      })}
    </View>
  );
};

export default Loader;

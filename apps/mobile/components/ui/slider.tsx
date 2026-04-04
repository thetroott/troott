import { semanticColors } from "@/constants/tailwind-bridge";
import React from "react";
import RNSlider from "@react-native-community/slider";

export type SliderProps = React.ComponentProps<typeof RNSlider> & {
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
};

const defaultMinimumTrackTintColor = semanticColors.primary;
const defaultMaximumTrackTintColor = semanticColors.muted;
const defaultThumbTintColor = semanticColors.primary;

export function Slider({
  minimumTrackTintColor = defaultMinimumTrackTintColor,
  maximumTrackTintColor = defaultMaximumTrackTintColor,
  thumbTintColor = defaultThumbTintColor,
  ...props
}: SliderProps) {
  return (
    <RNSlider
      minimumTrackTintColor={minimumTrackTintColor}
      maximumTrackTintColor={maximumTrackTintColor}
      thumbTintColor={thumbTintColor}
      {...props}
    />
  );
}

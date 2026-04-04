import { semanticColors } from "@/constants/tailwind-bridge";
import { ColorPalette, Typography } from '@/constants/theme';
import { cn } from '@/lib/utils';
import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export interface RadioButtonProps {
  label: string;
  description?: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export const RadioButton = ({
  label,
  description,
  value,
  selected,
  onSelect,
  disabled = false,
}: RadioButtonProps) => {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withSpring(selected ? 1 : 0, {
      damping: 20,
      stiffness: 150,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      animationProgress.value,
      [0, 1],
      ['rgba(0,0,0,0)', semanticColors.muted]
    ),
  }));

  const radioBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      animationProgress.value,
      [0, 1],
      [semanticColors.border, semanticColors.primary]
    ),
  }));

  const innerDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animationProgress.value }],
    opacity: animationProgress.value,
  }));

  const textColor = useAnimatedStyle(() => ({
    color: interpolateColor(
      animationProgress.value,
      [0, 1],
      [semanticColors.foreground, semanticColors.primary]
    ),
  }));

  const handlePress = () => {
    if (!disabled) {
      onSelect(value);
    }
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <Animated.View
        className={cn("rounded-2xl border p-3.5", disabled && "opacity-50")}
        style={containerStyle}
      >
        <Animated.View className="flex-row items-center justify-between">
          <Animated.View className="flex-1">
            <Animated.Text
              className="text-sm"
              style={[
                textColor,
                {
                  ...Typography.caption
                },
              ]}
            >
              {label}
            </Animated.Text>
            {description && (
              <Animated.Text
                className="text-sm mt-1"
                style={[
                  textColor,
                  {
                    ...Typography.caption
                  },
                ]}
              >
                {description}
              </Animated.Text>
            )}
          </Animated.View>
          <Animated.View className="ml-3">
            <Animated.View
              className="w-5 h-5 rounded-full justify-center items-center border border-neutral-50"
              style={radioBorderStyle}
            >
              <Animated.View
                className="w-2.5 h-2.5 rounded-full bg-primary-900"
                style={innerDotStyle}
              />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

RadioButton.displayName = 'RadioButton';


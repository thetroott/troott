import { ColorPalette, Typography } from '@/constants/theme';
import { cn } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export interface SelectionPillProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export const SelectionPill = ({
  label,
  selected,
  onToggle,
  disabled = false,
  className,
}: SelectionPillProps) => {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withTiming(selected ? 1 : 0, {
      duration: 300,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const iconBackgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      animationProgress.value,
      [0, 1],
      ['transparent', ColorPalette.primary[700]]
    ),
    transform: [{ scale: interpolate(animationProgress.value, [0, 1], [0.9, 1]) }],
  }));

  const iconRotationStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(animationProgress.value, [0, 1], [270, 360])}deg` },
    ],
  }));

  return (
    <Pressable onPress={onToggle} disabled={disabled}>
      <View
        className={cn(
          'flex-row h-11 items-center rounded-full pl-4 pr-2.5',
          disabled && 'opacity-50',
          className
        )}
        style={{
          backgroundColor: ColorPalette.pillBackground,
          borderWidth:1,
          borderColor: ColorPalette.pillBorder
        }}
      >
        <Animated.Text
          style={{
            color: ColorPalette.primary[700],
            marginRight: 8,
            ...Typography.body1
          }}
        >
          {label}
        </Animated.Text>
        <Animated.View
          className="w-6 h-6 rounded-full justify-center items-center ml-auto"
          style={iconBackgroundStyle}
        >
          <Animated.View style={iconRotationStyle}>
            {selected ? (
              <Ionicons name="checkmark" size={16} color={ColorPalette.neutral[0]} />
            ) : (
              <Ionicons name="add" size={18} color={ColorPalette.primary[700]} />
            )}
          </Animated.View>
        </Animated.View>
      </View>
    </Pressable>
  );
};

SelectionPill.displayName = 'SelectionPill';


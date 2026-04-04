import { Text } from '@/components/ui/text';
import { semanticColors } from "@/constants/tailwind-bridge";
import { ColorPalette } from '@/constants';
import { cn } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Image, ImageSourcePropType, Pressable, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Shadow } from 'react-native-shadow-2';

export interface SelectionCardProps {
  label: string;
  imageSource: ImageSourcePropType;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export const SelectionCard = ({
  label,
  imageSource,
  selected,
  onToggle,
  disabled = false,
  className,
}: SelectionCardProps) => {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withTiming(selected ? 1 : 0, {
      duration: 300,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const checkmarkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animationProgress.value, [0, 1], [0, 1]),
    transform: [
      { scale: interpolate(animationProgress.value, [0, 1], [0.5, 1]) },
    ],
  }));

  const circleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animationProgress.value, [0, 1], [1, 0]),
  }));

  return (
    <Pressable onPress={onToggle} disabled={disabled} style={{ overflow: 'visible' }}>
      <Shadow
        distance={20}
        startColor="#0000000A"
        offset={[4, 4]}
        paintInside={false}
        style={{ width: '100%', borderRadius: 8 }}
      >
        <View
          className={cn(
            'bg-card rounded-lg p-3 min-h-[100px] justify-between relative',
            disabled && 'opacity-50',
            className
          )}
        >
        {/* Selection Indicator - Top Right */}
        <View className="absolute top-3 right-3 z-10">
          {selected ? (
            <Animated.View
              style={[
                checkmarkStyle,
                {
                  width: 18,
                  height: 18,
                  borderRadius: 12,
                  backgroundColor: ColorPalette.secondary[900],
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <Ionicons name="checkmark" size={12} color={semanticColors.cardForeground} />
            </Animated.View>
          ) : (
            <Animated.View
              style={[
                circleStyle,
                {
                  width: 18,
                  height: 18,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: semanticColors.border,
                  backgroundColor: 'transparent',
                },
              ]}
            />
          )}
        </View>

        {/* Icon */}
        <View className="w-12 h-12 items-center justify-center">
          <Image
            source={imageSource}
            style={{ width: 44, height: 44 }}
            resizeMode="contain"
          />
        </View>

        {/* Label */}
        <Text variant='caption'  className="text-neutral-900 text-xs">
          {label}
        </Text>
        </View>
      </Shadow>
    </Pressable>
  );
};

SelectionCard.displayName = 'SelectionCard';
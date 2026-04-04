import { semanticColors } from "@/constants/tailwind-bridge";
import { ColorPalette } from '@/constants/theme';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  View,
  ViewStyle,
} from 'react-native';

export interface SwitchProps {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  onIcon?: React.ReactNode;
  offIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Switch = ({
  value,
  onValueChange,
  disabled = false,
  onIcon,
  offIcon,
  containerStyle,
}: SwitchProps) => {
  const translateX = useRef(new Animated.Value(value ? 20 : 2)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 20 : 2,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [value, translateX]);

  const handlePress = () => {
    if (!disabled && onValueChange) {
      onValueChange(!value);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={containerStyle}
    >
      <View
        className={cn(
          "h-6 w-[42px] rounded-full justify-center",
          disabled && "opacity-50"
        )}
        style={{
          backgroundColor: value
            ? ColorPalette.primary[700]
            : ColorPalette.primary[900],
        }}
      >
        <Animated.View
          className="h-5 w-5 rounded-full justify-center items-center"
          style={{
            backgroundColor: semanticColors.cardForeground,
            transform: [{ translateX }],
          }}
        >
          {value && onIcon && (
            <View className="w-[14px] h-[14px] justify-center items-center">
              {onIcon}
            </View>
          )}
          {!value && offIcon && (
            <View className="w-[14px] h-[14px] justify-center items-center">
              {offIcon}
            </View>
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
};

Switch.displayName = 'Switch';


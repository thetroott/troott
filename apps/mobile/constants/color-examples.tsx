/**
 * Color System Usage Examples
 * This file demonstrates various ways to use the color system
 */

import { ColorPalette, getColor, getLighterShade } from '@/constants';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

// Example 1: Using ColorPalette directly
export const Example1BasicUsage = () => (
  <View className="p-4 rounded-lg my-2" style={{ backgroundColor: ColorPalette.primary[50] }}>
    <Text style={{ color: ColorPalette.primary[900] }}>
      Basic Color Usage
    </Text>
  </View>
);

// Example 2: Using color utility functions
export const Example2WithUtils = () => {
  const bgColor = getColor('accent', 500);
  const lighterBg = getLighterShade('accent', 500, 2);
  
  return (
    <View className="p-4 rounded-lg my-2" style={{ backgroundColor: lighterBg }}>
      <Text style={{ color: bgColor }}>
        Using Color Utils
      </Text>
    </View>
  );
};

// Example 3: Creating themed button
export const Example3ThemedButton = ({ onPress }: { onPress: () => void }) => {
  const [pressed, setPressed] = React.useState(false);
  
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      className="py-3 px-6 rounded-lg items-center my-2"
      style={{
        backgroundColor: pressed 
          ? ColorPalette.primary[700]
          : ColorPalette.primary[600],
      }}
    >
      <Text className="text-base font-semibold" style={{ color: ColorPalette.neutral[0] }}>
        Press Me
      </Text>
    </Pressable>
  );
};

// Example 4: Status badges
export const Example4StatusBadges = () => (
  <View className="flex-row flex-wrap gap-2 my-2">
    <View className="py-1.5 px-3 rounded-2xl" style={{ backgroundColor: ColorPalette.success[100] }}>
      <Text style={{ color: ColorPalette.success[700] }}>Success</Text>
    </View>
    
    <View className="py-1.5 px-3 rounded-2xl" style={{ backgroundColor: ColorPalette.alert[100] }}>
      <Text style={{ color: ColorPalette.alert[700] }}>Error</Text>
    </View>
    
    <View className="py-1.5 px-3 rounded-2xl" style={{ backgroundColor: ColorPalette.accent[100] }}>
      <Text style={{ color: ColorPalette.accent[700] }}>Info</Text>
    </View>
    
    <View className="py-1.5 px-3 rounded-2xl" style={{ backgroundColor: ColorPalette.secondary[100] }}>
      <Text style={{ color: ColorPalette.secondary[700] }}>Warning</Text>
    </View>
  </View>
);

// Example 5: Card with shadow using rgba
export const Example5CardWithShadow = () => (
  <View
    className="p-4 rounded-xl my-2 shadow-lg"
    style={{
      backgroundColor: ColorPalette.neutral[0],
      shadowColor: ColorPalette.neutral[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }}
  >
    <Text className="text-lg font-semibold" style={{ color: ColorPalette.neutral[900] }}>
      Card Title
    </Text>
    <Text className="mt-2" style={{ color: ColorPalette.neutral[600] }}>
      Card content with proper color hierarchy
    </Text>
  </View>
);

// Example 6: Gradient-like effect using multiple shades
export const Example6GradientEffect = () => (
  <View className="flex-row h-[60px] rounded-lg overflow-hidden my-2">
    <View className="flex-1" style={{ backgroundColor: ColorPalette.primary[900] }} />
    <View className="flex-1" style={{ backgroundColor: ColorPalette.primary[700] }} />
    <View className="flex-1" style={{ backgroundColor: ColorPalette.primary[500] }} />
    <View className="flex-1" style={{ backgroundColor: ColorPalette.primary[300] }} />
    <View className="flex-1" style={{ backgroundColor: ColorPalette.primary[100] }} />
  </View>
);

// Example 7: NativeWind/Tailwind usage (JSX only)
export const Example7WithTailwind = () => (
  <View className="bg-primary-50 p-4 rounded-lg">
    <Text className="text-primary-900 text-lg font-bold">
      Using Tailwind Classes
    </Text>
    <Text className="text-neutral-600 mt-2">
      You can use bg-primary-50 through bg-primary-900
    </Text>
    <View className="flex-row gap-2 mt-4">
      <View className="bg-success-500 px-3 py-1 rounded">
        <Text className="text-white text-sm">Success</Text>
      </View>
      <View className="bg-alert-700 px-3 py-1 rounded">
        <Text className="text-white text-sm">Alert</Text>
      </View>
    </View>
  </View>
);

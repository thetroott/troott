import { ColorPalette, Typography } from '@/constants/theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface TabBarItemProps {
  label: string;
  icon: React.ReactNode;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const TabBarItem = ({ label, icon, isFocused, onPress, onLongPress }: TabBarItemProps) => {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withTiming(isFocused ? 1 : 0, {
      duration: 200,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(animationProgress.value, [0, 1], [1, 1.1]),
      },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(animationProgress.value, [0, 1], [12, 13]),
    color: interpolateColor(
      animationProgress.value,
      [0, 1],
      [ColorPalette.neutral[600], ColorPalette.primary[700]]
    ),
    opacity: interpolate(animationProgress.value, [0, 1], [0.7, 1]),
  }));

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      <View className="flex-col items-center justify-center min-w-[60px]">
        <Animated.View className="w-6 h-6 mb-3" style={iconStyle}>
          {icon}
        </Animated.View>
        <Animated.Text
          style={[
            {
              fontFamily: Typography.caption.fontFamily,
              fontWeight: isFocused ? Typography.body2.fontWeight : Typography.caption.fontWeight,
              lineHeight: Typography.caption.lineHeight,
              textAlign: 'center',
            },
            textStyle,
          ]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>
      </View>
    </Pressable>
  );
};

export const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View
      className="flex-row justify-around items-center bg-neutral-0 rounded-t-3xl px-3 py-4 pb-8"
      style={{
        shadowColor: 'rgba(0,0,0,0.25)',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const icon = options.tabBarIcon
          ? options.tabBarIcon({
              focused: isFocused,
              color: isFocused ? ColorPalette.primary[700] : ColorPalette.neutral[600],
              size: 24,
            })
          : null;

        return (
          <TabBarItem
            key={route.key}
            label={typeof label === 'string' ? label : route.name}
            icon={icon}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
    </View>
  );
};

TabBar.displayName = 'TabBar';


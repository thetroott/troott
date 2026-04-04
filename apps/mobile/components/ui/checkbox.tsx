import { ColorPalette } from '@/constants/theme';
import { cn } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './text';

export interface CheckboxProps {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  label?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
}

export const Checkbox = ({
  value,
  onValueChange,
  label,
  className,
  labelClassName,
  disabled = false,
}: CheckboxProps) => {
  return (
    <Pressable
      onPress={() => !disabled && onValueChange?.(!value)}
      disabled={disabled}
      hitSlop={8}
    >
      <View className={cn('flex-row items-start gap-3', disabled && 'opacity-50', className)}>
        <View
          className="w-5 h-5 rounded-sm items-center justify-center mt-0.5"
          style={{
            borderWidth: 1.5,
            borderColor: value ? ColorPalette.primary[900] : ColorPalette.primary[900],
            backgroundColor: value ? ColorPalette.primary[900] : 'transparent',
          }}
        >
          {value && (
            <Ionicons
              name="checkmark"
              size={14}
              color={ColorPalette.neutral[0]}
            />
          )}
        </View>

        {label !== undefined && (
          typeof label === 'string' ? (
            <Text
              variant="body2"
              className={cn('flex-1 text-neutral-600', labelClassName)}
            >
              {label}
            </Text>
          ) : (
            label
          )
        )}
      </View>
    </Pressable>
  );
};

Checkbox.displayName = 'Checkbox';



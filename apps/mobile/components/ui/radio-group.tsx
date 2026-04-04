import { cn } from '@/lib/utils';
import React from 'react';
import {
    View,
    ViewStyle,
} from 'react-native';
import { RadioButton } from './radio-button';
import { Text } from './text';

export interface RadioOption {
  label: string;
  value: string;
  description?: string;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  itemClassName?: string;
}

export const RadioGroup = ({
  options,
  value,
  onValueChange,
  label,
  disabled = false,
  containerStyle,
  itemClassName,
}: RadioGroupProps) => {
  return (
    <View style={containerStyle}>
      {label && (
        <Text variant="body1" className="mb-3">
          {label}
        </Text>
      )}
      <View className={cn("gap-3", itemClassName)}>
        {options.map((option) => (
          <RadioButton
            key={option.value}
            label={option.label}
            description={option.description}
            value={option.value}
            selected={value === option.value}
            onSelect={onValueChange}
            disabled={disabled}
          />
        ))}
      </View>
    </View>
  );
};

RadioGroup.displayName = 'RadioGroup';


import { cn } from '@/lib/utils';
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SelectionPill } from './selection-pill';
import { Text } from './text';

export interface SelectionOption {
  label: string;
  value: string;
}

export interface SelectionPillGroupProps {
  options: SelectionOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  label?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  className?: string;
}

export const SelectionPillGroup = ({
  options,
  selectedValues,
  onSelectionChange,
  label,
  disabled = false,
  containerStyle,
  className,
}: SelectionPillGroupProps) => {
  const handleToggle = (value: string) => {
    if (disabled) return;

    const isSelected = selectedValues.includes(value);
    const newSelection = isSelected
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];

    onSelectionChange(newSelection);
  };

  return (
    <View style={containerStyle}>
      {label && (
        <Text variant="body1" className="mb-3">
          {label}
        </Text>
      )}
      <View className={cn('flex-row flex-wrap gap-2', className)}>
        {options.map((option) => (
          <SelectionPill
            key={option.value}
            label={option.label}
            selected={selectedValues.includes(option.value)}
            onToggle={() => handleToggle(option.value)}
            disabled={disabled}
          />
        ))}
      </View>
    </View>
  );
};

SelectionPillGroup.displayName = 'SelectionPillGroup';


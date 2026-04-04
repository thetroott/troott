// components/ui/OTPInput.tsx
import React from 'react';
import { View, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

const { width: screenWidth } = Dimensions.get('window');

interface OTPInputProps {
  value: string;
  onChangeText: (text: string) => void;
  cellCount?: number;
  autoFocus?: boolean;
  horizontalPadding?: number;
  gapSize?: number;
  cellSize?: number;
}

const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChangeText,
  cellCount = 6,
  autoFocus = true,
  horizontalPadding = 48,
  gapSize = 12,
  cellSize: customCellSize,
}) => {
  const ref = useBlurOnFulfill({ value, cellCount });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue: onChangeText,
  });

  // Calculate responsive cell size
  const availableWidth = screenWidth - horizontalPadding;
  const totalGapWidth = (cellCount - 1) * gapSize;
  const calculatedCellSize = Math.min(
    48,
    (availableWidth - totalGapWidth) / cellCount
  );
  const finalCellSize = customCellSize || calculatedCellSize;

  const renderCell = ({ index, symbol, isFocused }: any) => {
    const isCurrentCell = index === value.length;
    const shouldHighlight =
      isFocused || (isCurrentCell && value.length < cellCount);

    return (
      <View
        key={index}
        className={`rounded-lg justify-center items-center bg-card ${
          shouldHighlight
            ? 'border-2 border-primary'
            : 'border border-border'
        }`}
        style={{
          width: finalCellSize,
          height: finalCellSize,
        }}
        onLayout={getCellOnLayoutHandler(index)}
      >
        <Text
          className="font-medium text-neutral-900"
          style={{
            fontSize: Math.min(20, finalCellSize * 0.4),
          }}
        >
          {symbol || (shouldHighlight ? <Cursor /> : null)}
        </Text>
      </View>
    );
  };

  return (
    <CodeField
      ref={ref}
      {...props}
      value={value}
      onChangeText={onChangeText}
      cellCount={cellCount}
      rootStyle={{
        justifyContent: 'center',
        gap: gapSize,
        width: '100%',
      }}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      autoFocus={autoFocus}
      renderCell={renderCell}
    />
  );
};

export default OTPInput;
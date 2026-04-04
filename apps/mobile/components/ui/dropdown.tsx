import React from 'react'
import { View } from 'react-native'
import { Dropdown as RNDropdown } from 'react-native-element-dropdown'
import { Ionicons } from '@expo/vector-icons'
import { cn } from '@/lib/utils'
import { useColorScheme } from '@/hooks/use-color-scheme.web'
import { semanticColors } from "@/constants/tailwind-bridge";
import { Colors, Typography } from '@/constants/theme'
import { Text } from './text'

export type DropdownItem = { label: string; value: string }

type BaseProps = {
  label?: string
  containerClassName?: string
  labelClassName?: string
  disabled?: boolean
}

type Props = BaseProps & { rightIconColor?: string } & Record<string, any>

const dropdownStyles = {
  height: 48,
  paddingHorizontal: 16,
  paddingVertical: 0,
  borderWidth: 0.3,
  borderColor: semanticColors.border,
  borderRadius: 8,
  backgroundColor: semanticColors.card,
  justifyContent: 'center',
  alignItems: 'stretch',
} as const

const placeholderStyle = {
  color: semanticColors.mutedForeground,
  fontSize: Typography.body2.fontSize,
  fontFamily: Typography.body2.fontFamily,
  lineHeight: 48,
} as const

const selectedTextStyle = {
  color: 'hsl(var(--foreground))',
  fontSize: Typography.body2.fontSize,
  fontFamily: Typography.body2.fontFamily,
  lineHeight: 48,
} as const

const inputSearchStyle = {
  height: 40,
  fontSize: Typography.body2.fontSize,
  borderRadius: 8,
  fontFamily: Typography.body2.fontFamily,
} as const

const iconStyle = {
  width: 20,
  height: 20,
  lineHeight:48
} as const

const containerStyle = {
  borderRadius: 8,
  marginTop: 8,
} as const

export function Dropdown({
  label,
  containerClassName,
  labelClassName,
  disabled,
  rightIconColor = semanticColors.mutedForeground,
  data = [],
  labelField = 'label',
  valueField = 'value',
  value,
  onChange,
  ...props
}: Props) {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
  return (
    <View className={cn('w-full', containerClassName)}>
      {label ? <Text  
             variant="body2"
            className="mb-1.5"
            style={{
              color: theme.text,
            }}>{label}</Text> : null}
      <RNDropdown
       renderItem={(item) => (
        <View style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
          <Text style={{ fontFamily: Typography.body2.fontFamily, fontSize: Typography.body2.fontSize }}>
            {item[labelField]}
          </Text>
        </View>
      )}
         activeColor='transparent'
        dropdownPosition="auto"
        mode="auto"
        containerStyle={containerStyle}
        placeholderStyle={placeholderStyle}
        selectedTextStyle={selectedTextStyle}
        inputSearchStyle={inputSearchStyle}
        iconStyle={iconStyle}
        renderRightIcon={() => <Ionicons name="chevron-down" size={20} color={rightIconColor} />}
        
        style={[
          dropdownStyles,
          disabled && { backgroundColor: 'hsl(var(--input-disabled))', borderColor: semanticColors.mutedForeground },
        ]}
        disable={disabled}
        data={data}
        labelField={labelField}
        valueField={valueField}
        value={value}
        onChange={onChange}
        {...props}
      />
    </View>
  )
}

export default Dropdown



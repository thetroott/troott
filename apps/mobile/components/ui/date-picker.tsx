import Input from '@/components/ui/input'
import { ColorPalette } from '@/constants'
import { Calendar1Icon } from 'lucide-react-native'
import React from 'react'
import { Pressable } from 'react-native'
import RNDatePicker from 'react-native-date-picker'

export interface DatePickerProps {
  label?: string
  value?: Date | string | number
  onChange?: (date: Date | undefined) => void
  minimumDate?: Date
  maximumDate?: Date
  placeholder?: string
  format?: (date?: Date) => string
  enabled?: boolean
  size?: 'sm' | 'default' | 'lg'
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  placeholder,
  format,
  enabled = true,
  size = 'default',
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const coerceToDate = (raw?: Date | string | number): Date | undefined => {
    if (!raw) return undefined
    if (raw instanceof Date) return raw
    const d = new Date(raw)
    return isNaN(d.getTime()) ? undefined : d
  }

  const formatDate = (d?: Date) =>
    d ? d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : ''
  const renderText = format || formatDate

  return (
    <>
      <Pressable className='flex flex-row justify-between' onPress={() => enabled && setIsOpen(true)}>
        <Input
          label={label}
          className='flex-1'
          placeholder={placeholder}
          value={renderText(coerceToDate(value))}
          editable={false}
          disabled={!enabled}
        //   size={size}
          onPressIn={() => enabled && setIsOpen(true)}
          trailingIcon={
           <Calendar1Icon size={20} color={ColorPalette.neutral[600]} />
          }
        />
      </Pressable>
      
      <RNDatePicker
        modal
        open={isOpen}
        date={coerceToDate(value) || new Date()}
        mode="date"
        minimumDate={coerceToDate(minimumDate)}
        maximumDate={coerceToDate(maximumDate)}
        onConfirm={(date: Date) => {
          onChange?.(date)
          setIsOpen(false)
        }}
        onCancel={() => {
          setIsOpen(false)
        }}
      />
    </>
  )
}

export default DatePicker



import { Text } from '@/components/ui/text'
import React from 'react'
import { Pressable } from 'react-native'

interface ChipProps {
  label: string
  selected?: boolean
  onPress: () => void
}

export const Chip = ({ label, selected = false, onPress }: ChipProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-[0.3rem] rounded-full ${
        selected ? 'bg-primary-900' : 'bg-primary-50 border border-pillBorder'
      }`}
    >
      <Text
        className={`text-sm tracking-wider ${
          selected ? 'text-white' : 'text-primary-900'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  )
}
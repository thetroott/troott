// components/ui/search-bar.tsx
import { Search } from 'lucide-react-native'
import React from 'react'
import Input from './input'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export const SearchBar = ({ 
  value, 
  onChangeText, 
  placeholder = 'Search' 
}: SearchBarProps) => {
  return (
    <Input
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      leftIcon={<Search size={18} color="#4d4d4d" />}
      containerstyle={{ marginTop: 8, marginBottom: 8 }}
    />
  )
}
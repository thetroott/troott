// components/ui/dropdown-menu.tsx
import React from 'react'
import { Modal, Pressable, View } from 'react-native'
import { Text } from './text'

interface DropdownMenuItem {
  label: string
  onPress: () => void
  variant?: 'default' | 'destructive'
}

interface DropdownMenuProps {
  visible: boolean
  onClose: () => void
  items: DropdownMenuItem[]
  anchorPosition?: {
    top?: number
    right?: number
    left?: number
  }
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  visible,
  onClose,
  items,
  anchorPosition = { top: 60, right: 16 }
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
      statusBarTranslucent
    >
      <Pressable 
        className="flex-1 bg-black/10"
        onPress={onClose}
      >
        <View 
          className="absolute min-w-[180px] rounded bg-card !text-center py-1 px-3.5 shadow-lg"
          style={{
            top: anchorPosition.top,
            right: anchorPosition.right,
            left: anchorPosition.left,
            shadowColor: 'rgba(0,0,0,0.25)',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {items.map((item, index) => (
            <Pressable
              key={index}
              className={`
                py-3.5 px-0
                ${index !== items.length - 1 ? 'border-b border-[#D8DCDE]' : ''}
              `}
              style={({ pressed }) => [
                pressed && { backgroundColor: '#F5F5F5' }
              ]}
              onPress={() => {
                item.onPress()
                onClose()
              }}
            >
              <Text 
                variant='body2'
                className={
                  item.variant === 'destructive' 
                    ? 'text-neutral-900 text-base' 
                    : 'text-neutral-900 text-base'
                }
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  )
}
import React from "react"
import {
  TextInput,
  View,
  StyleSheet,
  type TextInputProps,
  type ViewStyle
} from "react-native"
import { colors, spacing, radii, fontSizes } from "@troott/tokens"

export interface InputProps extends TextInputProps {
  containerStyle?: ViewStyle | ViewStyle[]
}

export function Input({ style, containerStyle, ...rest }: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        placeholderTextColor={colors.grey[400]}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.grey[400],
    borderRadius: radii.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.grey[800]
  },
  input: {
    fontSize: fontSizes.base,
    color: colors.white[50]
  }
})


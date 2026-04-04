import React from "react"
import { View, StyleSheet, type ViewProps } from "react-native"
import { colors, spacing, radii } from "@troott/tokens"

export interface CardProps extends ViewProps {
  padded?: boolean
  elevated?: boolean
}

export function Card({
  style,
  padded = true,
  elevated = false,
  ...rest
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        padded && styles.padded,
        elevated && styles.elevated,
        style
      ]}
      {...rest}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.grey[900],
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.grey[400]
  },
  padded: {
    padding: spacing.md
  },
  elevated: {
    shadowColor: colors.black[50],
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  }
})


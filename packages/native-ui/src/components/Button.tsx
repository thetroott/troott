import React from "react"
import {
  Pressable,
  Text,
  StyleSheet,
  type GestureResponderEvent,
  type ViewStyle,
  type TextStyle
} from "react-native"
import { colors, spacing, radii, fontSizes } from "@troott/tokens"

type ButtonVariant = "primary" | "secondary" | "danger"
type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
  disabled?: boolean
  onPress?: (event: GestureResponderEvent) => void
  style?: ViewStyle | ViewStyle[]
  textStyle?: TextStyle | TextStyle[]
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  disabled,
  onPress,
  style,
  textStyle
}: ButtonProps) {
  const { backgroundColor, textColor, borderColor } = getColors(variant, disabled)
  const { paddingHorizontal, height, fontSize } = getSizeTokens(size)

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderColor,
          paddingHorizontal,
          height,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
          borderRadius: radii.base
        },
        style
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize
          },
          textStyle
        ]}
      >
        {children}
      </Text>
    </Pressable>
  )
}

function getColors(variant: ButtonVariant, disabled?: boolean) {
  if (disabled) {
    return {
      backgroundColor: colors.grey[300],
      textColor: colors.grey[700],
      borderColor: colors.grey[300]
    }
  }

  switch (variant) {
    case "secondary":
      return {
        backgroundColor: colors.white[50],
        textColor: colors.blue[500],
        borderColor: colors.blue[300]
      }
    case "danger":
      return {
        backgroundColor: colors.red[500],
        textColor: colors.white[50],
        borderColor: colors.red[600]
      }
    case "primary":
    default:
      return {
        backgroundColor: colors.teal[500],
        textColor: colors.black[900],
        borderColor: colors.teal[600]
      }
  }
}

function getSizeTokens(size: ButtonSize) {
  switch (size) {
    case "sm":
      return {
        paddingHorizontal: spacing.sm,
        height: 36,
        fontSize: fontSizes.sm
      }
    case "lg":
      return {
        paddingHorizontal: spacing.lg,
        height: 52,
        fontSize: fontSizes.lg
      }
    case "md":
    default:
      return {
        paddingHorizontal: spacing.md,
        height: 44,
        fontSize: fontSizes.base
      }
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    fontWeight: "600"
  }
})


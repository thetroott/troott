import React from "react"
import { View, type ViewProps, StyleSheet } from "react-native"
import { spacing } from "@troott/tokens"

export interface StackProps extends ViewProps {
  gap?: keyof typeof spacing
}

export function Stack({ style, gap = "md", ...rest }: StackProps) {
  return (
    <View
      style={[styles.stack, { rowGap: spacing[gap] }, style]}
      {...rest}
    />
  )
}

export interface RowProps extends ViewProps {
  gap?: keyof typeof spacing
  align?: "start" | "center" | "end"
  justify?: "start" | "center" | "end" | "between"
}

export function Row({
  style,
  gap = "md",
  align = "center",
  justify = "start",
  ...rest
}: RowProps) {
  return (
    <View
      style={[
        styles.row,
        { columnGap: spacing[gap] },
        alignMap[align],
        justifyMap[justify],
        style
      ]}
      {...rest}
    />
  )
}

const styles = StyleSheet.create({
  stack: {
    flexDirection: "column"
  },
  row: {
    flexDirection: "row"
  }
})

const alignMap = StyleSheet.create({
  start: { alignItems: "flex-start" },
  center: { alignItems: "center" },
  end: { alignItems: "flex-end" }
})

const justifyMap = StyleSheet.create({
  start: { justifyContent: "flex-start" },
  center: { justifyContent: "center" },
  end: { justifyContent: "flex-end" },
  between: { justifyContent: "space-between" }
})


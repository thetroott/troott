// components/ui/circular-progress.tsx
import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Circle } from 'react-native-svg'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface CircularProgressProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  children?: React.ReactNode
}

export const CircularProgress = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#4a164b',
  backgroundColor = '#E9DBEC',
  children,
}: CircularProgressProps) => {
  const progressValue = useSharedValue(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  useEffect(() => {
    progressValue.value = withTiming(progress, {
      duration: 1500,
    })
  }, [progress])

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (progressValue.value / 100) * circumference
    return {
      strokeDashoffset,
    }
  })

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          animatedProps={animatedProps}
        />
      </Svg>
      {/* Center content */}
      {children && (
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {children}
        </View>
      )}
    </View>
  )
}


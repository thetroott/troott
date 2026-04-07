import { StyleSheet } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { theme } from '@/constants/theme'

const OnboardingLayout = () => {
  return (
    <Stack screenOptions={{
        headerShown:false,
        contentStyle:{
            flex:1,
            backgroundColor: theme.colors.grey[900]
        }
    }}>
        <Stack.Screen name='select-ministers'/>
        <Stack.Screen name='select-interests'/>
    </Stack>
  )
}

export default OnboardingLayout

const styles = StyleSheet.create({})
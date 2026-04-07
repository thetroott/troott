import {  StyleSheet, ViewStyle } from 'react-native'
import React from 'react'
import { SafeAreaProviderProps ,SafeAreaView} from 'react-native-safe-area-context'
import { theme } from '@/constants/theme'

interface ScreenViewProps extends SafeAreaProviderProps{
    children:React.ReactNode,
    screenStyle?:ViewStyle

}

const ScreenView = ({children,screenStyle,...props}:ScreenViewProps) => {
  return (
    <SafeAreaView {...props} style={{...styles.container,...screenStyle}}>
        {children}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
    paddingHorizontal:theme.sizes.spacing.md,
    gap:theme.sizes.spacing.lg,
    flex: 1,

  }
})
export default ScreenView
import { theme } from '@/constants/theme'
import { Slot, Stack } from 'expo-router'

const AuthLayout = () => {
  return (
    <Stack screenOptions={{
      headerShown:false,
      contentStyle:{
        backgroundColor: theme.colors.grey[950],
      }
    }}>
      <Stack.Screen name='create-account' options={{
        presentation:'formSheet'
      }}/>
    </Stack>
  )
}

export default AuthLayout
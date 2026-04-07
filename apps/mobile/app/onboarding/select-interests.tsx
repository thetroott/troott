import { StyleSheet, View } from 'react-native'
import React from 'react'
import ScreenView from '@/components/layouts/screenview'
import Text from '@/components/ui/text'
import { theme } from '@/constants/theme'
import { Interests } from '@/components/containers/onboarding'


const SelectInterests = () => {
  return (
    <ScreenView screenStyle={styles.screen}>
      <View style={styles.headerContainer}>
        <Text size="xl" color={theme.colors.white[100]} weight="medium">
          What topics interest you
        </Text>
        <Text size="sm">Pick 5 favorite intersts to customize your home feed</Text>
      </View>
      <Interests/>
      {/* <FavoriteMinisters /> */}

    </ScreenView>
  )
}

export default SelectInterests

const styles = StyleSheet.create({
    screen:{
        marginTop:theme.sizes.spacing["2xl"],
        flex: 1
    },
    headerContainer:{
        gap:10
    }
});

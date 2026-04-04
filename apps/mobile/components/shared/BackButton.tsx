import { router } from "expo-router";
import { ArrowLeft } from "iconsax-react-nativejs";
import React from "react";
import { TouchableOpacity, View } from 'react-native';
import { ColorPalette } from '@/constants';

const BackButton = () => {
  return (
    <View className="py-4">
        {/* Header with Back Button */}     
          <View className="flex-row items-center py-4">
            <TouchableOpacity
              onPress={router.back}
              className="flex-row items-center"
            >
              <ArrowLeft size={26} color={ColorPalette.neutral[900]} />
            </TouchableOpacity>
          </View>
      </View>
  )
}

export default BackButton
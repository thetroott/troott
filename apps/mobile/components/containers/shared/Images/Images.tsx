import React from 'react';
import { Image as RNImage, ImageProps, ImageSourcePropType, StyleProp, ImageStyle } from 'react-native';
import Svg, { SvgProps } from 'react-native-svg';

interface CustomImageProps  {
  source: any
  size?: number; 
  style?: any
  // Added size prop to control width & height
}

const CustomImage: React.FC<CustomImageProps> = (iprops) => {
  const { source, size, style,  ...props } = iprops;

  return (
    <RNImage
      source={source}
      style={[{ width: size, height: size }, style as StyleProp<ImageStyle>]} 
      {...props}
    />
  );
};

export default CustomImage;

import {
  View,
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from "react-native";
import React from "react";
import { theme } from "@/constants/theme";

interface TextProps extends RNTextProps {
  children: React.ReactNode;
  size?: FontSize;
  weight?: FontWeight;
  textStyle?: TextStyle;
  color?: string;
}
type FontSize = keyof typeof theme.sizes.typography;
type FontWeight = keyof typeof theme.typography;

function VariantStyle(
  size: FontSize ,
  weight: FontWeight,
  color: string
): TextStyle {
  return {
    fontSize: theme.sizes.typography[size],
    fontFamily: theme.typography[weight],
    color,
  };
}

const Text = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({size='sm',weight='regular',color=theme.colors.grey[200],textStyle,...props}: TextProps,ref) => {
    const defaultStyles=VariantStyle(size,weight,color)
    return (
      <RNText
      ref={ref}
        style={{
          ...defaultStyles,
          ...textStyle
        }}
        {...props}
      >
        {props.children}
      </RNText>
    );
  }
);

export default Text;

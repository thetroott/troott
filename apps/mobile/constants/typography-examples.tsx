/**
 * Typography System Usage Examples
 * This file demonstrates various ways to use the typography system
 */

import { Text } from '@/components/ui/text';
import { ColorPalette, Typography } from '@/constants';
import React from 'react';
import { Pressable, View } from 'react-native';

// Example 1: Using variant prop (Recommended)
export const Example1Headers = () => (
  <View className="p-4">
    <Text variant="h1">Main Page Title</Text>
    <Text variant="h2" className="mt-3">Section Header</Text>
    <Text variant="h3" className="mt-3">Subsection Title</Text>
    <Text variant="h4" className="mt-3">Card Header</Text>
  </View>
);

// Example 2: Body text with color theming
export const Example2BodyText = () => (
  <View className="p-4">
    <Text variant="body1" style={{ color: ColorPalette.neutral[900] }}>
      This is the primary body text. Use it for main paragraphs and primary content 
      that users will read. It's optimized for readability with 16px size.
    </Text>
    
    <Text variant="body2" className="mt-3" style={{ color: ColorPalette.neutral[700] }}>
      This is secondary body text. Use it for supporting information, form labels, 
      or less prominent content. Slightly smaller at 14px.
    </Text>
  </View>
);

// Example 3: Caption and small text
export const Example3SmallText = () => (
  <View className="p-4">
    <Text variant="caption" style={{ color: ColorPalette.neutral[600] }}>
      Image caption or helper text goes here
    </Text>
    
    <Text variant="small" className="mt-3" style={{ color: ColorPalette.neutral[500] }}>
      Legal text or fine print - Last updated: Jan 2025
    </Text>
  </View>
);

// Example 4: Button typography
export const Example4Buttons = () => {
  const [primaryPressed, setPrimaryPressed] = React.useState(false);
  const [secondaryPressed, setSecondaryPressed] = React.useState(false);
  
  return (
    <View className="p-4 gap-3">
      <Pressable
        onPressIn={() => setPrimaryPressed(true)}
        onPressOut={() => setPrimaryPressed(false)}
        className="py-3 px-6 rounded-lg items-center"
        style={{
          backgroundColor: primaryPressed ? ColorPalette.primary[700] : ColorPalette.primary[600]
        }}
      >
        <Text variant="button" style={{ color: ColorPalette.neutral[0] }}>
          Primary Action
        </Text>
      </Pressable>
      
      <Pressable
        onPressIn={() => setSecondaryPressed(true)}
        onPressOut={() => setSecondaryPressed(false)}
        className="py-3 px-6 rounded-lg items-center border-2"
        style={{ 
          borderColor: ColorPalette.primary[600],
          backgroundColor: secondaryPressed ? ColorPalette.primary[50] : 'transparent'
        }}
      >
        <Text variant="buttonSecondary" style={{ color: ColorPalette.primary[600] }}>
          Secondary Action
        </Text>
      </Pressable>
    </View>
  );
};

// Example 5: Using Typography object directly
export const Example5DirectTypography = () => (
  <View className="p-4">
    <Text style={[Typography.h2, { color: ColorPalette.accent[600] }]}>
      Custom Styled Header
    </Text>
    
    <Text className="mt-3" style={[Typography.body1, { color: ColorPalette.neutral[800] }]}>
      Using Typography object directly for more control
    </Text>
  </View>
);

// Example 6: Card with mixed typography
export const Example6Card = () => (
  <View 
    className="p-4 rounded-xl m-4 shadow-lg"
    style={{
      backgroundColor: ColorPalette.neutral[0],
      shadowColor: ColorPalette.neutral[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }}
  >
    <Text variant="h3" style={{ color: ColorPalette.neutral[900] }}>
      Product Card Title
    </Text>
    
    <Text variant="body2" className="mt-3" style={{ color: ColorPalette.neutral[700] }}>
      This is a description of the product. It provides key information 
      about features and benefits.
    </Text>
    
    <View className="flex-row justify-between items-center mt-4">
      <Text variant="h4" style={{ color: ColorPalette.primary[600] }}>
        $99.99
      </Text>
      <Text variant="caption" style={{ color: ColorPalette.neutral[500] }}>
        Free shipping
      </Text>
    </View>
  </View>
);

// Example 7: Form with labels
export const Example7Form = () => (
  <View className="p-4">
    <Text variant="body2" style={{ color: ColorPalette.neutral[900] }}>
      Email Address *
    </Text>
    <Text variant="caption" className="mt-1" style={{ color: ColorPalette.neutral[600] }}>
      We'll never share your email with anyone else
    </Text>
    
    <Text variant="body2" className="mt-3" style={{ color: ColorPalette.neutral[900] }}>
      Password *
    </Text>
    <Text variant="caption" className="mt-1" style={{ color: ColorPalette.neutral[600] }}>
      Must be at least 8 characters
    </Text>
  </View>
);

// Example 8: List with consistent typography
export const Example8List = () => {
  const items = [
    { title: 'Feature One', desc: 'Description of first feature' },
    { title: 'Feature Two', desc: 'Description of second feature' },
    { title: 'Feature Three', desc: 'Description of third feature' },
  ];
  
  return (
    <View className="p-4">
      {items.map((item, index) => (
        <View key={index} className="py-3 border-b border-neutral-200">
          <Text variant="h4" style={{ color: ColorPalette.neutral[900] }}>
            {item.title}
          </Text>
          <Text variant="body2" className="mt-1" style={{ color: ColorPalette.neutral[600] }}>
            {item.desc}
          </Text>
        </View>
      ))}
    </View>
  );
};

// Example 9: Combining with NativeWind/Tailwind
export const Example9WithTailwind = () => (
  <View className="p-4 bg-neutral-0">
    <Text variant="h1" className="text-primary-600 mb-2">
      Typography with Tailwind
    </Text>
    
    <Text variant="body1" className="text-neutral-900 dark:text-neutral-50 mb-4">
      Combining typography variants with Tailwind utility classes for maximum flexibility.
    </Text>
    
    <Text variant="caption" className="text-neutral-500">
      This approach gives you the best of both worlds
    </Text>
  </View>
);

// Example 10: Responsive text sizing
export const Example10Responsive = () => (
  <View className="p-4">
    <Text variant="h1" numberOfLines={2} ellipsizeMode="tail">
      This is a very long heading that might need to wrap or truncate
    </Text>
    
    <Text variant="body1" className="mt-3" numberOfLines={3} ellipsizeMode="tail">
      Long paragraph text that will automatically wrap based on the container 
      width. The typography system ensures proper line height and letter spacing 
      for optimal readability across all screen sizes.
    </Text>
  </View>
);

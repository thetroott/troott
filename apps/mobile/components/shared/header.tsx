import Button from "@/components/ui/button";
import { ColorPalette, Typography } from "@/constants";
import { router } from "expo-router";
import { ArrowLeft } from "iconsax-react-nativejs";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title?: string;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  centerElement?: React.ReactNode;
  onPressBack?: () => void;
  showBackButton?: boolean;
  showRightElement?: boolean;
  rightElementRoute?: string;
  onRightElementPress?: () => void;
}


const Header = (data: HeaderProps) => {
  
    const {
    title = "",
    rightElement,
    leftElement,
    centerElement,
    onPressBack,
    showBackButton = true,
    showRightElement = false,
    rightElementRoute,
    onRightElementPress,
  } = data;

  const defaultLeftElement = showBackButton ? (
    <TouchableOpacity
              onPress={onPressBack}
              style={styles.sideElement}
              className="flex-row items-center"
            >
              <ArrowLeft size={26} color={ColorPalette.neutral[900]} />
            </TouchableOpacity>
  ) : null;

  const handleRightElementPress = () => {
    if (onRightElementPress) {
      onRightElementPress();
    } else if (rightElementRoute) {
      router.push(rightElementRoute as any);
    } else {
      console.log("Skip pressed");
    }
  };

  const defaultRightElement = showRightElement ? (
    <Button 
      variant="secondary"  
      className={`h-10 w-22 ${ColorPalette.primary[900]}`}
      onPress={handleRightElementPress}
    >
      Skip
    </Button>
  ) : null;

  return (
    <View style={[styles.container]}>
      <View style={styles.content}>
        {/* Left Element: Back button */}
        <View style={styles.left}>
          {leftElement !== undefined ? leftElement : defaultLeftElement}
        </View>

        {/* Center Element: Title */}
        <View style={styles.center}>
          {centerElement !== undefined ? (
            centerElement
          ) : (
            <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
          )}
        </View>

        {/* Right Element: Skip button */}
       <View style={styles.right}>
          {rightElement !== undefined ? rightElement : defaultRightElement}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPalette.neutral[0],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ColorPalette.neutral[0],
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 4,
  },
  left: {
    flex: 1,
    alignItems: "flex-start",
  },
  center: {
    flex: 2,
    alignItems: "center",
  },
  right: {
    flex: 1,
    alignItems: "flex-end",
  },
  titleText: {
    ...Typography.h6,
    color: ColorPalette.neutral[900],
  },
  skipText: {
    ...Typography.body2,
    color: ColorPalette.primary[400],
  },
  sideElement: {
    padding: 0, 
    margin: -8, 
  },
});

export default Header;
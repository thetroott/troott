import {
  TextInput,
  TextInputProps,
  ViewStyle,
  StyleSheet,
  Pressable,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import React from "react";
import { theme } from "@/constants/theme";
import { sizes } from "@/constants/sizes";
import { colors } from "@/constants/colors";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Eye, EyeSlash } from "iconsax-react-nativejs";
import Button from "./button";

interface InputProps extends TextInputProps {
  containerstyle?: ViewStyle;
  label?: string;
  leftIcon?: React.ReactNode;
  inputcontainerstyles?: ViewStyle;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  (
    {
      containerstyle,
      secureTextEntry,
      label,
      leftIcon,
      inputcontainerstyles,
      disabled,
      onBlur,
      onFocus,
      autoCorrect = false,
      ...props
    }: InputProps,
    ref
  ) => {
    const styles = dynamicStyles((disabled = false));

    const focusProgress = useSharedValue(0);

    const animatedStyles = useAnimatedStyle(() => ({
      borderColor: interpolateColor(
        focusProgress.value,
        [0, 1],
        [theme.colors.grey[500], theme.colors.grey[200]]
      ),
    }));

    function handleBlur(e: NativeSyntheticEvent<TextInputFocusEventData>) {
      focusProgress.value = withTiming(0);
      onBlur?.(e);
    }

    function handleFocus(e: NativeSyntheticEvent<TextInputFocusEventData>) {
      focusProgress.value = withTiming(1);
      onFocus?.(e);
    }

    const [secureText, setSecureText] = React.useState(false);
    React.useEffect(() => {
      setSecureText(secureTextEntry ?? false);
    }, [secureTextEntry]);

        function handleToggle() {
      if (secureText) {
        setSecureText(false);
        return
      }
        setSecureText(true);

    }
    return (
      <AnimatedPressable style={[{...styles.container,...containerstyle}, animatedStyles]}>
        {leftIcon && leftIcon}
        <TextInput
          autoCorrect={false}
          placeholderTextColor={theme.colors.grey[400]}
          {...props}
          ref={ref}
          style={{...styles.inputContainer, ...inputcontainerstyles}}
          onBlur={handleBlur}
          onFocus={handleFocus}
          secureTextEntry={secureText}
        />
       {
          secureTextEntry && <Button  variant="ghost" onPress={handleToggle}  style={styles.eyeContainer}>
            {secureText &&<EyeSlash  size={18} color={theme.colors.grey[400]} />}
            {!secureText &&<Eye  size={18} color={theme.colors.grey[400]} />}
          </Button>
        }
      </AnimatedPressable>
    );
  }
);

const dynamicStyles = (disabled: boolean) =>
  StyleSheet.create({
    container: {
      height: 48,
      borderRadius: theme.sizes.radius.xs,
      borderWidth: 1,
      borderColor: theme.colors.grey[800],
      backgroundColor: theme.colors.grey[900],
      flexDirection: "row",
      gap: 5,
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: sizes.spacing.md,
    },
    inputContainer: {
      width: "90%",
      color: colors.grey[100],
      height: "100%",
      alignItems: "center",
      fontFamily: theme.typography.regular,
    },
    eyeContainer:{
      position:'absolute',
      // top:12,
      right:theme.sizes.spacing.md
    }
  });

export default Input;

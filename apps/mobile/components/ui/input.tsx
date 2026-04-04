import {
  TextInput,
  TextInputProps,
  ViewStyle,
  Pressable,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import React from "react";
import { theme } from "@/constants/theme";
import { colors } from "@/constants/colors";
import { cn } from "@/lib/utils";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Eye, EyeSlash } from "iconsax-react-nativejs";
import Button from "./button";

export interface InputProps extends TextInputProps {
  containerstyle?: ViewStyle;
  label?: string;
  leftIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  inputcontainerstyles?: ViewStyle;
  disabled?: boolean;
  className?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  (
    {
      containerstyle,
      secureTextEntry,
      label,
      leftIcon,
      trailingIcon,
      inputcontainerstyles,
      disabled,
      className,
      onBlur,
      onFocus,
      autoCorrect = false,
      ...props
    }: InputProps,
    ref
  ) => {
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
      <AnimatedPressable
        className={cn("h-12 rounded border border-neutral-700 bg-neutral-900 flex-row gap-1 justify-between items-center px-4", className)}
        style={[animatedStyles, containerstyle]}
      >
        {leftIcon && leftIcon}
        <TextInput
          autoCorrect={false}
          placeholderTextColor={theme.colors.grey[400]}
          {...props}
          ref={ref}
          style={[
            {
              width: "90%",
              color: colors.grey[100],
              height: "100%",
              alignItems: "center",
              fontFamily: theme.typography.regular,
            },
            inputcontainerstyles,
          ]}
          onBlur={handleBlur}
          onFocus={handleFocus}
          secureTextEntry={secureText}
        />
        {trailingIcon && trailingIcon}
        {secureTextEntry && (
          <Button
            variant="ghost"
            onPress={handleToggle}
            className="absolute right-4"
          >
            {secureText && (
              <EyeSlash size={18} color={theme.colors.grey[400]} />
            )}
            {!secureText && <Eye size={18} color={theme.colors.grey[400]} />}
          </Button>
        )}
      </AnimatedPressable>
    );
  }
);

// theme.typography.regular (fontFamily) kept in style; migration doc allows theme for typography when extended in Tailwind later.

export default Input;

import { View, ViewStyle, TextStyle } from 'react-native';
import React from 'react';
import {
    Control,
    Controller,
    FieldValues,
    Path,
    PathValue,
    RegisterOptions,
} from 'react-hook-form';
import Animated, {
    FadeInLeft,
    FadeOutLeft,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Input from './input';
import Text from './text';
import { theme } from '@/constants/theme';

interface FormInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    rules?: RegisterOptions<T>;
    defaultValue?: PathValue<T, Path<T>>;
    label: string;
    placeholder?: string;
    leftIcon?: React.ReactNode;
    containerStyle?: ViewStyle;
    multiline?: boolean;
    inputContainerStyle?: TextStyle;
}

const AnimatedText = Animated.createAnimatedComponent(Text);

const FormInput = <T extends FieldValues>({
    name,
    control,
    rules,
    defaultValue,
    label,
    placeholder,
    leftIcon,
    containerStyle,
    multiline = false,
    inputContainerStyle,
}: FormInputProps<T>) => {
    const textcolor = useSharedValue('#9ca3af');
    const animatedTextStyle = useAnimatedStyle(() => ({
        color: textcolor.value,
    }));
    function handleFocusTextAnimation() {
        textcolor.value = withTiming('#ffffff', { duration: 200 });
    }
    function handleBlurTextAnimation() {
        textcolor.value = withTiming('#9ca3af', { duration: 200 });
    }

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            defaultValue={defaultValue}
            render={({ field, fieldState }) => (
                <Animated.View
                    style={[containerStyle, { gap: theme.sizes.spacing.sm }]}
                >
                    <AnimatedText textStyle={[animatedTextStyle]}>
                        {label}
                    </AnimatedText>
                    {/* RHF ref omitted: React 19 can throw on frozen ref when unmounting. */}
                    <Input
                        value={
                            field.value == null
                                ? ''
                                : String(field.value as string)
                        }
                        onFocus={handleFocusTextAnimation}
                        onBlur={() => {
                            field.onBlur();
                            handleBlurTextAnimation();
                        }}
                        onChangeText={field.onChange}
                        placeholder={placeholder}
                        secureTextEntry={name == 'password'}
                        leftIcon={leftIcon}
                        autoCapitalize="none"
                        multiline={multiline}
                        containerstyle={containerStyle}
                        inputcontainerstyles={inputContainerStyle}
                    />

                    {fieldState.error && (
                        <Animated.View
                            entering={FadeInLeft.duration(500)}
                            exiting={FadeOutLeft.duration(100)}
                        >
                            <Text>{fieldState.error.message}</Text>
                        </Animated.View>
                    )}
                </Animated.View>
            )}
        />
    );
};

export default FormInput;

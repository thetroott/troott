import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
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
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Input from './input';
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
    secureTextEntry?: boolean;
    editable?: boolean;
}

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
    secureTextEntry,
    editable = true,
}: FormInputProps<T>) => {
    const focusProgress = useSharedValue(0);

    const labelStyle = useAnimatedStyle(() => ({
        color: interpolateColor(
            focusProgress.value,
            [0, 1],
            [theme.colors.grey[400], theme.colors.grey[100]],
        ),
    }));

    const handleFocus = () => {
        focusProgress.value = withTiming(1, { duration: 200 });
    };

    const handleBlur = (fieldOnBlur: () => void) => {
        focusProgress.value = withTiming(0, { duration: 200 });
        fieldOnBlur();
    };

    const isSecure = secureTextEntry ?? name === 'password';

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            defaultValue={defaultValue}
            render={({ field, fieldState }) => (
                <Animated.View style={[styles.field, containerStyle]}>
                    <Animated.Text style={[styles.label, labelStyle]}>
                        {label}
                    </Animated.Text>
                    <Input
                        value={
                            field.value == null
                                ? ''
                                : String(field.value as string)
                        }
                        onFocus={handleFocus}
                        onBlur={() => handleBlur(field.onBlur)}
                        onChangeText={field.onChange}
                        placeholder={placeholder}
                        secureTextEntry={isSecure}
                        leftIcon={leftIcon}
                        autoCapitalize="none"
                        multiline={multiline}
                        inputcontainerstyles={inputContainerStyle}
                        editable={editable}
                    />

                    {fieldState.error && (
                        <Animated.Text
                            entering={FadeInLeft.duration(280).springify()}
                            exiting={FadeOutLeft.duration(120)}
                            style={styles.error}
                        >
                            {fieldState.error.message}
                        </Animated.Text>
                    )}
                </Animated.View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    field: {
        gap: theme.sizes.spacing.sm,
    },
    label: {
        fontFamily: theme.typography.medium,
        fontSize: theme.sizes.typography.sm,
        letterSpacing: 0.2,
    },
    error: {
        fontFamily: theme.typography.regular,
        fontSize: theme.sizes.typography.xs,
        color: theme.colors.red[400],
    },
});

export default FormInput;

import { View, ViewStyle } from 'react-native';
import React, { useEffect } from 'react';
import {
    Control,
    Controller,
    FieldValues,
    Path,
    PathValue,
    RegisterOptions,
    useController,
} from 'react-hook-form';
import * as Switch from '@rn-primitives/switch';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { theme } from '@/constants/theme';

interface FormInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    rules?: RegisterOptions<T>;
    defaultValue?: PathValue<T, Path<T>>;
}

const FormSwitch = <T extends FieldValues>({
    name,
    control,
    rules,
    defaultValue,
}: FormInputProps<T>) => {
    const { field, fieldState } = useController({
        name,
        control,
        rules,
        defaultValue,
    });

    const translateProgress = useSharedValue(0);
    useEffect(() => {
        translateProgress.value = field.value ? withTiming(1) : withTiming(0);
    }, [field.value, translateProgress]);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: interpolate(
                    translateProgress.value,
                    [0, 1],
                    [0, 26],
                ),
            },
        ],
    }));
    return (
        <Controller
            control={control}
            name={name}
            defaultValue={defaultValue}
            render={() => (
                <Switch.Root
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    style={{
                        borderRadius: theme.sizes.radius.full,
                        backgroundColor: field.value
                            ? theme.colors.grey[600]
                            : theme.colors.grey[400],
                        width: 56,
                        padding: 2,
                    }}
                >
                    <Animated.View style={animatedStyle}>
                        <Switch.Thumb
                            style={{
                                width: theme.sizes.spacing.lg + 4,
                                height: theme.sizes.spacing.lg + 4,
                                borderRadius: theme.sizes.radius.full,
                                backgroundColor: '#ffffff',
                            }}
                        />
                    </Animated.View>
                </Switch.Root>
            )}
        />
    );
};

export default FormSwitch;

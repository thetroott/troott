import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import React, { useEffect } from 'react';
import { theme } from '@/constants/theme';
import Text from './text';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Input from './input';

interface OTPInputProps {
    value: string;
    onChangeText: (e: string) => void;
}

const OTPInput = ({ value = '', onChangeText }: OTPInputProps) => {
    const inputRef = React.useRef<TextInput>(null);

    function checkIfNextActiveInput(index: number): boolean {
        const emptyInput = [0, 1, 2, 3, 4, 5].filter((i) => !value[i])[0];
        return emptyInput === index;
    }
    function handleFocus() {
        console.log('gey');
        inputRef.current?.focus();
    }
    useEffect(() => {
        console.log(value);
        if (value.length == 6) {
            inputRef.current?.blur();
            Keyboard.dismiss();
        }
    }, [value]);
    const styles = dynamicstyles();
    return (
        <View style={styles.otpContainer}>
            {[...Array(6).keys()].map((_, index) => {
                const styles = dynamicstyles(checkIfNextActiveInput(index));
                return (
                    <Pressable
                        key={index}
                        style={styles.otpInput}
                        onPress={handleFocus}
                    >
                        {!value[index] && checkIfNextActiveInput(index) && (
                            <Indicator />
                        )}
                        {!value[index] && !checkIfNextActiveInput(index) && (
                            <StaleInput />
                        )}
                        {value[index] && (
                            <Text style={styles.otpText}>{value[index]}</Text>
                        )}
                    </Pressable>
                );
            })}
            <View style={styles.hidden}>
                <Input
                    defaultValue=""
                    ref={inputRef}
                    onChangeText={onChangeText}
                    disabled={value.length === 6}
                    autoFocus
                    inputMode="numeric"
                />
            </View>
        </View>
    );
};

export default OTPInput;

function Indicator() {
    const flashProgress = useSharedValue(0);
    useEffect(() => {
        flashProgress.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 500 }),
                withTiming(0, { duration: 500 }),
            ),
            -1,
        );
    }, []);
    const animatedStyles = useAnimatedStyle(() => ({
        opacity: interpolate(flashProgress.value, [0, 1], [0, 1]),
        transform: [
            { scale: interpolate(flashProgress.value, [0, 1], [0.7, 1]) },
        ],
        height: '50%',
        width: 2,
        backgroundColor: '#007AFF',
        borderRadius: theme.sizes.radius.full,
    }));
    return <Animated.View style={animatedStyles} />;
}

function StaleInput() {
    const styles = dynamicstyles();
    return <View style={styles.staleInput} />;
}

const dynamicstyles = (isCursor?: boolean) =>
    StyleSheet.create({
        otpContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        otpInput: {
            width: theme.sizes.screen.width * 0.15 - 10,
            height: theme.sizes.screen.width * 0.15 - 10,
            borderWidth: 1,
            borderColor: isCursor
                ? theme.colors.grey[200]
                : theme.colors.grey[500],
            borderRadius: 5,
            alignItems: 'center',
            justifyContent: 'center',
        },
        otpText: {
            fontSize: theme.sizes.typography.sm,
            fontFamily: theme.typography.regular,
            color: theme.colors.grey[100],
        },
        staleInput: {
            backgroundColor: theme.colors.grey[500],
            width: '50%',
            height: 2,
            borderRadius: theme.sizes.radius.full,
        },
        hidden: {
            position: 'absolute',
            top: 500,
            left: 0,
            width: 200,
            height: 0,
            opacity: 0,
        },
        text: {
            color: theme.colors.grey[100],
        },
    });

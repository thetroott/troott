import React from 'react';
import { Pressable, type ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '@/constants/colors';

const smallSize = 28;
const regularSize = 34;
const largeSize = 44;

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

export default function Icon({
    name,
    onPress,
    onPressIn,
    small,
    large,
    disabled,
    color,
    flex,
    testID,
}: {
    name: string;
    onPress?: () => void;
    onPressIn?: () => void;
    small?: boolean;
    large?: boolean;
    disabled?: boolean;
    color?: string | undefined;
    flex?: number | undefined;
    testID?: string | undefined;
}): React.JSX.Element {
    const iconSize = large ? largeSize : small ? smallSize : regularSize;
    const resolvedColor = disabled
        ? colors.grey[400]
        : color ?? colors.white[100];

    const wrapStyle: ViewStyle = {
        width: iconSize + 8,
        height: iconSize + 8,
        justifyContent: 'center',
        alignItems: 'center',
        flex,
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={onPressIn}
            disabled={disabled || (!onPress && !onPressIn)}
            hitSlop={HIT_SLOP}
            style={wrapStyle}
            testID={testID}
        >
            <MaterialCommunityIcons
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                name={name as any}
                size={iconSize}
                color={resolvedColor}
            />
        </Pressable>
    );
}

import React from 'react';
import Svg, { Path } from 'react-native-svg';

/** `solar:arrow-right-up-linear`-style chevron (Figma search suggestion rows 5176:22330). */
export default function SearchArrowRightUp({
    color,
    size = 24,
}: {
    color: string;
    size?: number;
}) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M7 17L17 7M17 7h-6M17 7v6"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

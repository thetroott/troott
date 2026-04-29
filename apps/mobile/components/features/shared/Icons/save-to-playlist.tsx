import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';

/**
 * List with add (add to playlist). Matches list-plus style glyph.
 */
export default function SaveToPlaylistIcon({
    color = 'currentColor',
    width = 24,
    height = 24,
    ...rest
}: SvgProps) {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            {...rest}
        >
            <Path
                d="M19 8H5m0 4h9m-3 4H5m10 0h6m-3-3v6"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
            />
        </Svg>
    );
}

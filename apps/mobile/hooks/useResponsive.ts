import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

const BASE_WIDTH = 375; // design reference width
const MIN_SCALE = 0.85; // optional: prevents too small
const MAX_SCALE = 1.25; // optional: prevents too big

type ResponsiveDimensions = {
    width: number;
    height: number;
    scale: number;
};

export function useResponsiveScale(): ResponsiveDimensions {
    const getDimensions = () => {
        const { width, height } = Dimensions.get('window');
        const rawScale = width / BASE_WIDTH;
        const scale = Math.max(MIN_SCALE, Math.min(rawScale, MAX_SCALE));
        return { width, height, scale };
    };

    const [dimensions, setDimensions] = useState(getDimensions);

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', () => {
            setDimensions(getDimensions());
        });
        return () => subscription?.remove();
    }, []);

    return dimensions;
}

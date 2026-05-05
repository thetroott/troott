import React from 'react';
import { useThemeStore } from '@/store/theme.store';

type TroottLogoProps = React.ImgHTMLAttributes<HTMLImageElement>;

export const TroottLogo: React.FC<Omit<TroottLogoProps, 'src' | 'alt'>> = (
    props,
) => {
    const resolvedTheme = useThemeStore((s) => s.resolvedTheme);

    const logoSrc =
        resolvedTheme === 'dark'
            ? '/images/assets/troott-icon.svg'
            : '/images/assets/troott-icon-dark.svg';

    return (
        <img
            src={logoSrc}
            alt="Troott Logo"
            width={100}
            height={100}
            {...props}
        />
    );
};

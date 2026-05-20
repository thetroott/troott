import React from 'react';


type TroottLogoProps = React.ImgHTMLAttributes<HTMLImageElement>;

export const TroottLogo: React.FC<Omit<TroottLogoProps, 'src' | 'alt'>> = (
    props,
) => {


    // const logoSrc =
    //     resolvedTheme === 'dark'
    //         ? '/images/assets/troott-icon.svg'
    //         : '/images/assets/troott-icon-dark.svg';
    const logoSrc = '/images/assets/troott-icon.svg';

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

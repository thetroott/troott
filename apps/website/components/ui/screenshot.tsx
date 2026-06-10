import Image from 'next/image';

import { cx } from '@/lib/utils';

interface ScreenshotProps {
    srcLight: string;
    srcDark?: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
}

export function Screenshot({
    srcLight,
    srcDark,
    alt,
    width,
    height,
    className,
}: ScreenshotProps) {
    if (!srcDark) {
        return (
            <Image
                src={srcLight}
                alt={alt}
                width={width}
                height={height}
                className={className}
                unoptimized={srcLight.endsWith('.svg')}
            />
        );
    }

    return (
        <>
            <Image
                src={srcLight}
                alt={alt}
                width={width}
                height={height}
                className={cx(className, 'block dark:hidden')}
                unoptimized={srcLight.endsWith('.svg')}
            />
            <Image
                src={srcDark}
                alt={alt}
                width={width}
                height={height}
                className={cx(className, 'hidden dark:block')}
                unoptimized={srcDark.endsWith('.svg')}
            />
        </>
    );
}

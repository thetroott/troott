/* eslint-disable @next/next/no-img-element */

import type { LogoCloudItem } from '@/_data/troott/logo-cloud';
import { cx } from '@/lib/utils';

type LogoImgProps = LogoCloudItem & {
    className?: string;
};

export function LogoImg({
    src,
    alt,
    invertOnDark = true,
    className,
}: LogoImgProps) {
    return (
        <img
            className={cx(
                'mx-auto h-10 w-fit',
                invertOnDark && 'dark:invert',
                className,
            )}
            src={src}
            alt={alt}
            height={40}
            width="auto"
            loading="lazy"
            decoding="async"
        />
    );
}

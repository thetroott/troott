import type { LucideIcon } from 'lucide-react';

import { cx } from '@/lib/utils';

export type NavIconVariant = 'neutral' | 'brand' | 'brand-filled';

const iconBoxStyles: Record<
    NavIconVariant,
    { box: string; icon: string }
> = {
    neutral: {
        box: 'border border-white/10 bg-neutral-900',
        icon: 'text-gray-50',
    },
    brand: {
        box: 'border border-teal-800/60 bg-neutral-900',
        icon: 'text-teal-400',
    },
    'brand-filled': {
        box: 'border border-teal-400/50 bg-teal-400',
        icon: 'text-neutral-950',
    },
};

type NavDropdownIconProps = {
    icon: LucideIcon;
    variant?: NavIconVariant;
    size?: 'sm' | 'md';
    className?: string;
};

export function NavDropdownIcon({
    icon: Icon,
    variant = 'neutral',
    size = 'md',
    className,
}: NavDropdownIconProps) {
    const styles = iconBoxStyles[variant];
    const boxSize = size === 'sm' ? 'size-9' : 'size-10';
    const iconSize = size === 'sm' ? 'size-4' : 'size-[18px]';

    return (
        <div
            className={cx(
                'flex shrink-0 items-center justify-center rounded-md',
                boxSize,
                styles.box,
                className,
            )}
        >
            <Icon className={cx(iconSize, styles.icon)} strokeWidth={2} />
        </div>
    );
}

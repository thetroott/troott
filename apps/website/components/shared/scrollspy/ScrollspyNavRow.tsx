import type { RemixiconComponentType } from '@remixicon/react';
import Link from 'next/link';

import { cx } from '@/lib/utils';

type ScrollspyNavRowProps = {
    href: string;
    label: string;
    icon: RemixiconComponentType;
    isActive: boolean;
    isRoute?: boolean;
    uppercase?: boolean;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

export function ScrollspyNavRow({
    href,
    label,
    icon: Icon,
    isActive,
    isRoute = false,
    uppercase = true,
    onClick,
}: ScrollspyNavRowProps) {
    const className = cx(
        'group flex w-full items-center gap-3 py-4 pl-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/40',
        isActive ? ' text-white' : ' text-zinc-500 hover:text-zinc-300',
    );

    const content = (
        <>
            <span
                className={cx(
                    'flex size-8 shrink-0 items-center justify-center rounded-sm bg-neutral-50/10 transition-colors',
                    isActive ? 'bg-teal-400' : 'group-hover:bg-teal-500',
                )}
            >
                <Icon aria-hidden="true" className="size-4 text-white" />
            </span>
            <span
                className={cx(
                    'text-sm font-normal tracking-wide',
                    uppercase && 'uppercase',
                )}
            >
                {label}
            </span>
        </>
    );

    if (isRoute) {
        return (
            <li className="border-b border-white/10">
                <Link
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    className={className}
                >
                    {content}
                </Link>
            </li>
        );
    }

    return (
        <li className="border-b border-white/10">
            <a
                href={href}
                onClick={onClick}
                aria-current={isActive ? 'true' : undefined}
                className={className}
            >
                {content}
            </a>
        </li>
    );
}

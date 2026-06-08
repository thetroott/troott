import Link from 'next/link';

import type { NavDropdownItem } from '@/_data/troott/navigation';
import { NavDropdownIcon } from '@/components/containers/navbar/NavDropdownIcon';
import { cx } from '@/lib/utils';

type NavDropdownLinkProps = {
    item: NavDropdownItem;
    onNavigate?: () => void;
    className?: string;
};

export function NavDropdownLink({
    item,
    onNavigate,
    className,
}: NavDropdownLinkProps) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noopener noreferrer' : undefined}
            className={cx(
                'group hover:bg-accent/50 focus:bg-accent/50 flex flex-row items-start gap-4 rounded-lg p-3 leading-none no-underline outline-hidden transition-colors select-none',
                className,
            )}
            onClick={onNavigate}
        >
            {Icon ? (
                <NavDropdownIcon
                    icon={Icon}
                    variant={item.iconVariant ?? 'neutral'}
                />
            ) : null}
            <div className="min-w-0 flex-1 space-y-1.5 pt-0.5 transition-transform duration-300 group-hover:translate-x-0.5">
                <div className="text-sm leading-snug font-medium text-foreground">
                    {item.title}
                </div>
                <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                    {item.description}
                </p>
            </div>
        </Link>
    );
}

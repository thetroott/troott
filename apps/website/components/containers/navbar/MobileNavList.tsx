'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

import {
    getMobileDropdownItems,
    type NavDropdownItem,
    type NavItem,
} from '@/_data/troott/navigation';
import { NavDropdownLink } from '@/components/containers/navbar/NavDropdownLink';
import { cx } from '@/lib/utils';

type MobileNavListProps = {
    items: NavItem[];
    pathname: string;
    openDropdown: string | null;
    onToggleDropdown: (label: string) => void;
    onNavigate: () => void;
};

function MobileNavRow({
    item,
    onNavigate,
}: {
    item: NavDropdownItem;
    onNavigate: () => void;
}) {
    return (
        <NavDropdownLink
            item={item}
            onNavigate={onNavigate}
            className="px-0 py-2 hover:bg-transparent"
        />
    );
}

function MobileAccordionPanel({
    link,
    onNavigate,
}: {
    link: NavItem;
    onNavigate: () => void;
}) {
    if ('sections' in link && link.sections) {
        return (
            <div className="mt-6 space-y-6">
                {link.sections.map((section) => (
                    <div key={section.label} className="space-y-1">
                        <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
                            {section.label}
                        </p>
                        {section.items.map((item) => (
                            <MobileNavRow
                                key={item.title}
                                item={item}
                                onNavigate={onNavigate}
                            />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    const items = getMobileDropdownItems(link);
    return (
        <div className="mt-6 space-y-1">
            {items.map((item) => (
                <MobileNavRow
                    key={item.title}
                    item={item}
                    onNavigate={onNavigate}
                />
            ))}
        </div>
    );
}

export function MobileNavList({
    items,
    pathname,
    openDropdown,
    onToggleDropdown,
    onNavigate,
}: MobileNavListProps) {
    return (
        <nav className="divide-border flex flex-1 flex-col divide-y divide-white/10">
            {items.map((link) => {
                const dropdownItems = getMobileDropdownItems(link);

                if (dropdownItems.length > 0) {
                    const isOpen = openDropdown === link.label;

                    return (
                        <div
                            key={link.label}
                            className="py-5 first:pt-0 last:pb-0"
                        >
                            <button
                                type="button"
                                onClick={() => onToggleDropdown(link.label)}
                                className="text-foreground flex w-full items-center justify-between text-2xl font-medium tracking-tight"
                            >
                                {link.label}
                                <ChevronDown
                                    className={cx(
                                        'text-muted-foreground size-5 shrink-0 transition-transform duration-200',
                                        isOpen && 'rotate-180',
                                    )}
                                />
                            </button>
                            <div
                                className={cx(
                                    'overflow-hidden transition-all duration-300',
                                    isOpen
                                        ? 'max-h-[3000px] opacity-100'
                                        : 'max-h-0 opacity-0',
                                )}
                            >
                                <MobileAccordionPanel
                                    link={link}
                                    onNavigate={onNavigate}
                                />
                            </div>
                        </div>
                    );
                }

                if ('href' in link && link.href) {
                    return (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={cx(
                                'text-foreground hover:text-foreground/80 py-5 text-2xl font-medium tracking-tight transition-colors first:pt-0 last:pb-0',
                                pathname === link.href &&
                                    'text-muted-foreground',
                            )}
                            onClick={onNavigate}
                        >
                            {link.label}
                        </Link>
                    );
                }

                return null;
            })}
        </nav>
    );
}

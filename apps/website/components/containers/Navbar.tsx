'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Linkedin, X } from 'lucide-react';
import { RiPlayCircleFill, RiUploadCloudFill } from '@remixicon/react';
import { track } from '@vercel/analytics';

import { siteConfig } from '@/app/siteConfig';
import { NavigationItems, type NavItem } from '@/_data/troott/navigation';
import { Button } from '@/components/ui/button';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { NavDropdownLink } from '@/components/containers/navbar/NavDropdownLink';
import Newsletter from '@/components/NewsletterModal';
import { MobileNavList } from '@/components/containers/navbar/MobileNavList';
import { cx } from '@/lib/utils';
import { TroottLogo } from '@/public/TroottLogo';

function HeaderActions({
    className,
    onOpenListener,
    onOpenMinister,
    loginClassName,
}: {
    className?: string;
    onOpenListener: () => void;
    onOpenMinister: () => void;
    loginClassName?: string;
}) {
    return (
        <div className={cx('flex flex-wrap items-center gap-2', className)}>
            <Button
                asChild
                variant="link"
                size="lg"
                className={cx(
                    'h-10 px-3 text-sm font-medium md:text-base',
                    loginClassName,
                )}
            >
                <Link
                    href={siteConfig.baseLinks.login}
                   
                >
                    Request Demo
                </Link>
            </Button>
            <Button
                size="lg"
                className={cx(
                    'h-10 rounded-md px-4 text-sm font-medium md:text-base',
                    'bg-foreground text-background hover:bg-foreground/90',
                )}
                onClick={onOpenListener}
            >
                Start listening
                <RiPlayCircleFill
                    aria-hidden="true"
                    className="size-4 shrink-0"
                />
            </Button>
            {/* <Button
                variant="outline"
                size="lg"
                className={cx(
                    'h-10 rounded-sm px-4 text-sm font-medium md:text-base',
                    'border-foreground/30 bg-background text-foreground',
                    'hover:bg-muted hover:text-foreground',
                )}
                onClick={onOpenMinister}
            >
                <RiUploadCloudFill
                    aria-hidden="true"
                    className="size-4 shrink-0"
                />
                Upload sermons
            </Button> */}
        </div>
    );
}

export function Navigation() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [role, setRole] = useState<'listener' | 'minister'>('listener');

    const openListenerModal = () => {
        setRole('listener');
        track('listenerSignup');
        setDialogOpen(true);
    };

    const openMinisterModal = () => {
        setRole('minister');
        track('ministerSignup');
        setDialogOpen(true);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (isMenuOpen) {
                setIsMenuOpen(false);
                setOpenDropdown(null);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMenuOpen]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        const handleMediaQueryChange = () => {
            setIsMenuOpen(false);
            setOpenDropdown(null);
        };

        mediaQuery.addEventListener('change', handleMediaQueryChange);
        handleMediaQueryChange();

        return () => {
            mediaQuery.removeEventListener('change', handleMediaQueryChange);
        };
    }, []);

    const closeMobileMenu = () => {
        setIsMenuOpen(false);
        setOpenDropdown(null);
    };

    const renderDesktopNavItem = (link: NavItem) => {
        if ('sections' in link && link.sections) {
            return (
                <NavigationMenuItem key={link.label}>
                    <NavigationMenuTrigger className="h-9 bg-transparent! px-2 text-sm font-medium md:px-2.5 md:text-base data-[state=open]:bg-accent/50">
                        {link.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="left-0 top-full mt-1.5 w-auto rounded-md border border-border/80 bg-popover p-0 shadow-md">
                        <div className="grid w-[840px] grid-cols-2 divide-x divide-border/80">
                            {link.sections.map((section) => (
                                <div key={section.label} className="p-4">
                                    <p className="text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase">
                                        {section.label}
                                    </p>
                                    <ul className="space-y-1">
                                        {section.items.map((item) => (
                                            <li key={item.title}>
                                                <NavDropdownLink item={item} />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            );
        }

        if ('dropdownItems' in link && link.dropdownItems) {
            return (
                <NavigationMenuItem key={link.label}>
                    <NavigationMenuTrigger className="h-9 bg-transparent! px-2 text-sm font-medium md:px-2.5 md:text-base data-[state=open]:bg-accent/50">
                        {link.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="left-0 top-full mt-1.5 w-auto rounded-md border border-border/80 bg-popover p-0 shadow-md">
                        <ul className="w-[420px] space-y-1 p-3">
                            {link.dropdownItems.map((item) => (
                                <li key={item.title}>
                                    <NavDropdownLink item={item} />
                                </li>
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            );
        }

        if ('href' in link) {
            return (
                <NavigationMenuItem key={link.label}>
                    <Link
                        href={link.href}
                        className={cx(
                            'relative h-9 bg-transparent px-2 text-sm font-medium transition-opacity hover:opacity-75 md:px-2.5 md:text-base',
                            pathname === link.href && 'text-muted-foreground',
                        )}
                    >
                        {link.label}
                    </Link>
                </NavigationMenuItem>
            );
        }

        return null;
    };

    return (
        <>
            <header
                className={cx(
                    'sticky top-0 z-50 w-full transition-all duration-300',
                    'border-border/70 bg-background/70 backdrop-blur-md',
                    isMenuOpen && 'max-lg:bg-background',
                )}
            >
                <div
                    className={cx(
                        'relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8',
                        'max-lg:z-[110]',
                    )}
                >
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <Link
                            href={siteConfig.baseLinks.home}
                            className="flex shrink-0 items-center"
                            aria-label="Home"
                        >
                            <TroottLogo className="w-20 md:w-22" />
                        </Link>

                        <NavigationMenu
                            viewport={false}
                            className="max-lg:hidden w-max max-w-none flex-none justify-start"
                        >
                            <NavigationMenuList className="justify-start gap-x-3 sm:gap-x-4">
                                {NavigationItems.map(renderDesktopNavItem)}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <HeaderActions
                            className="max-lg:hidden"
                            onOpenListener={openListenerModal}
                            onOpenMinister={openMinisterModal}
                        />

                        <button
                            type="button"
                            className="text-muted-foreground relative flex size-8 lg:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="sr-only">
                                {isMenuOpen
                                    ? 'Close main menu'
                                    : 'Open main menu'}
                            </span>
                            <div className="absolute top-1/2 left-1/2 block w-[18px] -translate-x-1/2 -translate-y-1/2">
                                <span
                                    aria-hidden
                                    className={cx(
                                        'absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out',
                                        isMenuOpen
                                            ? 'rotate-45'
                                            : '-translate-y-1.5',
                                    )}
                                />
                                <span
                                    aria-hidden
                                    className={cx(
                                        'absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out',
                                        isMenuOpen && 'opacity-0',
                                    )}
                                />
                                <span
                                    aria-hidden
                                    className={cx(
                                        'absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out',
                                        isMenuOpen
                                            ? '-rotate-45'
                                            : 'translate-y-1.5',
                                    )}
                                />
                            </div>
                        </button>
                    </div>
                </div>

                <div
                    className={cx(
                        'bg-background fixed inset-0 z-[100] flex h-[100dvh] max-h-[100dvh] flex-col overflow-y-auto px-6 pt-20 pb-6 transition-all duration-300 ease-in-out lg:hidden',
                        isMenuOpen
                            ? 'visible opacity-100'
                            : 'pointer-events-none invisible -translate-y-4 opacity-0',
                    )}
                >
                    <MobileNavList
                        items={NavigationItems}
                        pathname={pathname}
                        openDropdown={openDropdown}
                        onToggleDropdown={(label) =>
                            setOpenDropdown(
                                openDropdown === label ? null : label,
                            )
                        }
                        onNavigate={closeMobileMenu}
                    />

                    <div className="mt-8 space-y-4">
                        <HeaderActions
                            className="flex-col items-stretch [&_button]:w-full [&_a]:w-full [&_a]:justify-center"
                            onOpenListener={() => {
                                openListenerModal();
                                closeMobileMenu();
                            }}
                            onOpenMinister={() => {
                                openMinisterModal();
                                closeMobileMenu();
                            }}
                        />
                    </div>

                    <div className="border-border/70 mt-8 border-t pt-6">
                        <p className="text-muted-foreground mb-4 text-left text-sm">
                            The discipleship infra for ministers and teachers.
                        </p>
                        <div className="flex items-center gap-4">
                            <p className="text-foreground text-sm font-medium">
                                Follow us:
                            </p>
                            <div className="flex gap-3">
                                <Link
                                    href="https://x.com/thetroott"
                                    aria-label="Follow on X (Twitter)"
                                    className="bg-accent hover:bg-primary flex size-9 items-center justify-center rounded-lg transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    <X className="size-5" />
                                </Link>
                                <Link
                                    href="https://www.linkedin.com/company/troott"
                                    aria-label="Follow on LinkedIn"
                                    className="bg-accent hover:bg-primary flex size-9 items-center justify-center rounded-lg transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    <Linkedin className="size-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <Newsletter
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                user_type={role}
            />
        </>
    );
}

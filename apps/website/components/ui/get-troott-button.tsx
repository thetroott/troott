'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';

import {
    getDownloadCta,
    getSsrDownloadCta,
    type DownloadCtaConfig,
} from '@/_data/troott/download-platforms';
import { Button } from '@/components/ui/button';
import { usePlatform } from '@/hooks/usePlatform';
import { isGetTroottEnabled } from '@/lib/get-troott-download';
import { cx } from '@/lib/utils';

type GetTroottButtonProps = {
    label?: string;
    labelMode?: 'compact' | 'full';
    variant?: 'primary' | 'neutral' | 'pill';
    showShortcut?: boolean;
    shortcutClassName?: string;
    shortcutKey?: string;
    onFallback?: () => void;
    getTroottEnabled?: boolean;
    className?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
};

export function GetTroottButton({
    label,
    labelMode = 'compact',
    variant = 'primary',
    showShortcut = false,
    shortcutClassName,
    shortcutKey = 'D',
    onFallback,
    getTroottEnabled = isGetTroottEnabled(),
    className,
    size = 'lg',
}: GetTroottButtonProps) {
    const platform = usePlatform();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const cta: DownloadCtaConfig = mounted
        ? getDownloadCta(platform, labelMode)
        : getSsrDownloadCta();

    useEffect(() => {
        if (!showShortcut || !getTroottEnabled) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() !== shortcutKey.toLowerCase()) return;
            if (
                event.target instanceof HTMLElement &&
                (event.target.isContentEditable ||
                    event.target.tagName === 'INPUT' ||
                    event.target.tagName === 'TEXTAREA')
            ) {
                return;
            }
            event.preventDefault();
            window.open(cta.href, '_blank', 'noopener,noreferrer');
            track(cta.analytics);
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showShortcut, getTroottEnabled, shortcutKey, cta.href, cta.analytics]);

    const variantClasses =
        variant === 'pill'
            ? 'rounded-sm bg-white px-6 py-2.5 text-sm font-normal text-black hover:bg-white/90'
            : variant === 'neutral'
              ? 'rounded-sm border border-white/15 bg-white/10 text-white hover:bg-white/15'
              : 'rounded-sm bg-foreground text-background hover:bg-foreground/90';

    const content = (
        <>
            <span>{label ?? cta.label}</span>
            <cta.Icon aria-hidden="true" className="size-4 shrink-0" />
            {showShortcut ? (
                <kbd
                    className={cx(
                        'border-border/70 text-muted-foreground rounded-sm bg-neutral-200/50 px-2 py-0 text-[10px] font-medium',
                        shortcutClassName ?? 'hidden md:inline-flex',
                    )}
                >
                    {shortcutKey}
                </kbd>
            ) : null}
        </>
    );

    if (!getTroottEnabled) {
        return (
            <Button
                type="button"
                size={size}
                className={cx(
                    'inline-flex h-10 items-center gap-2 px-4 text-sm font-normal md:text-base',
                    variantClasses,
                    className,
                )}
                onClick={() => {
                    track('downloadCtaFallback');
                    onFallback?.();
                }}
                aria-label={cta.ariaLabel}
            >
                {content}
            </Button>
        );
    }

    return (
        <Button
            asChild
            size={size}
            className={cx(
                'inline-flex h-10 items-center gap-2 px-4 text-sm font-normal md:text-base',
                variantClasses,
                className,
            )}
        >
            <Link
                href={cta.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={cta.ariaLabel}
                onClick={() => track(cta.analytics)}
            >
                {content}
            </Link>
        </Button>
    );
}

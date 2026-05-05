import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Toaster as Sonner } from 'sonner';
import type { ToasterProps } from 'sonner';
import {
    getResolvedTheme,
    getSystemTheme,
    useThemeStore,
} from '@/store/theme.store';

const Toaster = ({ ...props }: ToasterProps) => {
    const mode = useThemeStore((s) => s.theme);
    const [toastTheme, setToastTheme] = useState<'light' | 'dark'>(() =>
        typeof window !== 'undefined' ? getResolvedTheme(mode) : 'light',
    );

    useEffect(() => {
        setToastTheme(getResolvedTheme(mode));
        if (mode !== 'system') return;

        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => setToastTheme(getSystemTheme());
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, [mode]);

    return (
        <Sonner
            theme={toastTheme}
            className="toaster group"
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                } as CSSProperties
            }
            {...props}
        />
    );
};

export { Toaster };

/* eslint-disable @next/next/no-img-element */

import type { FeaturedPartner } from '@/_data/troott/featured-partners';
import { cx } from '@/lib/utils';

const GRADIENT_STYLES: Record<
    FeaturedPartner['gradient'],
    { base: string; glow: string }
> = {
    teal: {
        base: 'bg-gradient-to-br from-teal-950 via-cyan-900/90 to-slate-950',
        glow: 'bg-cyan-400/25',
    },
    amber: {
        base: 'bg-gradient-to-br from-amber-950 via-orange-900/80 to-stone-950',
        glow: 'bg-orange-400/20',
    },
    lavender: {
        base: 'bg-gradient-to-br from-violet-300/25 via-purple-200/15 to-amber-100/10',
        glow: 'bg-violet-300/30',
    },
    gold: {
        base: 'bg-gradient-to-br from-amber-100/15 via-yellow-50/10 to-purple-200/15',
        glow: 'bg-amber-200/25',
    },
    indigo: {
        base: 'bg-gradient-to-br from-indigo-950 via-blue-900/90 to-teal-950',
        glow: 'bg-blue-400/20',
    },
};

export function PartnerCard({ partner }: { partner: FeaturedPartner }) {
    const styles = GRADIENT_STYLES[partner.gradient];
    const { logo } = partner;

    return (
        <article
            className={cx(
                'relative min-h-[9.5rem] overflow-hidden rounded-2xl border border-white/[0.08]',
                'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
                partner.gridClass,
                styles.base,
            )}
        >
            <div
                className={cx(
                    'pointer-events-none absolute -right-8 -top-10 size-32 rounded-full blur-3xl',
                    styles.glow,
                )}
                aria-hidden
            />
            <div
                className={cx(
                    'pointer-events-none absolute -bottom-12 -left-6 size-36 rounded-full blur-3xl',
                    styles.glow,
                )}
                aria-hidden
            />

            <span className="absolute left-3 top-3 z-10 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                {partner.tag}
            </span>

            <div className="relative flex h-full min-h-[9.5rem] items-center justify-center px-6 py-10">
                <img
                    className="h-8 w-auto max-w-[80%] object-contain brightness-0 invert sm:h-9"
                    src={logo.src}
                    alt={logo.alt}
                    loading="lazy"
                    decoding="async"
                />
            </div>
        </article>
    );
}

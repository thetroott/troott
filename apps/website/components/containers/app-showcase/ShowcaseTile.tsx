import Image from 'next/image';

import {
    accentClasses,
    type ShowcaseTile as ShowcaseTileType,
} from '@/_data/troott/app-showcase';
import { cx } from '@/lib/utils';

export function ShowcaseTile({ tile }: { tile: ShowcaseTileType }) {
    const shellClass =
        'relative size-[132px] shrink-0 overflow-hidden rounded-[20px] border border-white/10 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]';

    if (tile.kind === 'photo') {
        return (
            <div className={shellClass}>
                <Image
                    src={tile.src}
                    alt={tile.alt}
                    fill
                    className="object-cover"
                    sizes="132px"
                />
            </div>
        );
    }

    const Icon = tile.icon;
    const accent = accentClasses[tile.accent];

    return (
        <div
            className={cx(
                shellClass,
                'flex flex-col items-center justify-center gap-3 bg-[#161616] p-4',
                accent.glow,
            )}
        >
            <span
                className={cx(
                    'flex size-10 items-center justify-center rounded-full',
                    accent.badge,
                )}
            >
                <Icon aria-hidden className="size-5" />
            </span>
            <p className="text-center text-[13px] leading-tight text-zinc-400">
                {tile.label}
            </p>
        </div>
    );
}

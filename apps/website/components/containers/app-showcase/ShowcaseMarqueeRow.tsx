'use client';

import type { ShowcaseTile as ShowcaseTileType } from '@/_data/troott/app-showcase';
import { Marquee } from '@/components/magicui/marquee';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';

import { ShowcaseTile } from './ShowcaseTile';

export function ShowcaseMarqueeRow({
    tiles,
    reverse = false,
}: {
    tiles: ShowcaseTileType[];
    reverse?: boolean;
}) {
    return (
        <div className="relative" aria-hidden>
            <Marquee
                reverse={reverse}
                pauseOnHover
                className="[--duration:45s] [--gap:1rem] motion-reduce:[animation:none]"
                repeat={2}
            >
                {tiles.map((tile) => (
                    <ShowcaseTile key={tile.id} tile={tile} />
                ))}
            </Marquee>

            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-32 bg-gradient-to-r from-background" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-32 bg-gradient-to-l from-background" />
            <ProgressiveBlur
                className="pointer-events-none absolute inset-y-0 left-0 z-20 h-full w-20"
                direction="left"
                blurIntensity={1}
            />
            <ProgressiveBlur
                className="pointer-events-none absolute inset-y-0 right-0 z-20 h-full w-20"
                direction="right"
                blurIntensity={1}
            />
        </div>
    );
}

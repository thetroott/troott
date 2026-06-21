'use client';

import type { ShowcaseTile as ShowcaseTileType } from '@/_data/troott/app-showcase';
import { InfiniteSlider } from '@/components/ui/infinite-slider';

import { ShowcaseTile } from './ShowcaseTile';

function buildLoopTiles(tiles: ShowcaseTileType[], copies = 3) {
    return Array.from({ length: copies }, () => tiles).flat();
}

export function ShowcaseMarqueeRow({
    tiles,
    reverse = false,
}: {
    tiles: ShowcaseTileType[];
    reverse?: boolean;
}) {
    const loopTiles = buildLoopTiles(tiles);

    return (
        <div className="w-full" aria-hidden>
            <InfiniteSlider
                speed={36}
                speedOnHover={18}
                gap={16}
                reverse={reverse}
                className="w-full"
            >
                {loopTiles.map((tile, index) => (
                    <ShowcaseTile key={`${tile.id}-${index}`} tile={tile} />
                ))}
            </InfiniteSlider>
        </div>
    );
}

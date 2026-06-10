'use client';

import Image from 'next/image';

import { appShowcaseContent } from '@/_data/troott/app-showcase';

import { ShowcaseMarqueeRow } from './ShowcaseMarqueeRow';
import { ShowcaseTile } from './ShowcaseTile';

function MobileShowcase() {
    const previewTiles = [
        ...appShowcaseContent.rows[0].tiles.slice(0, 4),
    ];

    return (
        <div className="flex flex-col items-center gap-8 lg:hidden">
            <div
                className="flex flex-wrap justify-center gap-4"
                aria-hidden
            >
                {previewTiles.map((tile) => (
                    <ShowcaseTile key={tile.id} tile={tile} />
                ))}
            </div>
            <Image
                src={appShowcaseContent.phone.src}
                alt={appShowcaseContent.phone.alt}
                width={appShowcaseContent.phone.width}
                height={560}
                className="h-auto w-[220px] drop-shadow-[0_24px_48px_rgba(0,0,0,0.55)] sm:w-[272px]"
                priority
            />
        </div>
    );
}

export function AppShowcaseSection() {
    const { phone, rows } = appShowcaseContent;

    return (
        <section
            id="app-showcase"
            aria-label="Troott app showcase"
            className="overflow-hidden bg-background py-20 lg:py-24"
        >
            <div className="relative w-screen left-1/2 -translate-x-1/2">
                <MobileShowcase />

                <div className="relative hidden lg:block lg:min-h-[560px]">
                    <div className="absolute inset-x-0 top-[calc(50%-156px)]">
                        <ShowcaseMarqueeRow tiles={rows[0].tiles} />
                    </div>
                    <div className="absolute inset-x-0 top-[calc(50%+24px)]">
                        <ShowcaseMarqueeRow tiles={rows[1].tiles} reverse />
                    </div>
                    <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
                        <Image
                            src={phone.src}
                            alt={phone.alt}
                            width={phone.width}
                            height={560}
                            className="h-auto w-[272px] drop-shadow-[0_24px_48px_rgba(0,0,0,0.55)]"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

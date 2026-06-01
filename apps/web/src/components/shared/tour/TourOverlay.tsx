import React from 'react';
import { cn } from '@/lib/utils';

export interface SpotlightRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface TourOverlayProps {
    rect: SpotlightRect | null;
}

const TourOverlay: React.FC<TourOverlayProps> = ({ rect }) => {
    if (!rect) {
        return (
            <div
                className="fixed inset-0 z-[100] bg-black/70 pointer-events-auto"
                aria-hidden
            />
        );
    }

    const pad = 6;
    const x = Math.max(0, rect.left - pad);
    const y = Math.max(0, rect.top - pad);
    const w = rect.width + pad * 2;
    const h = rect.height + pad * 2;
    const maskId = 'troott-tour-spotlight-mask';

    return (
        <div
            className="fixed inset-0 z-[100] pointer-events-auto"
            aria-hidden
        >
            <svg className="absolute inset-0 h-full w-full">
                <defs>
                    <mask id={maskId}>
                        <rect width="100%" height="100%" fill="white" />
                        <rect
                            x={x}
                            y={y}
                            width={w}
                            height={h}
                            rx={8}
                            fill="black"
                        />
                    </mask>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0,0,0,0.7)"
                    mask={`url(#${maskId})`}
                />
            </svg>
            <div
                className={cn(
                    'pointer-events-none absolute rounded-lg border-2 border-[#08ffdb] shadow-[0_0_0_1px_rgba(255,255,255,0.15)]',
                )}
                style={{
                    top: y,
                    left: x,
                    width: w,
                    height: h,
                }}
            />
        </div>
    );
};

export default TourOverlay;

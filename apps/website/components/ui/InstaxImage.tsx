'use client';
import { cx } from '@/lib/utils';
import Image from 'next/image';

export function InstaxImage({
    className,
    src,
    width,
    height,
    alt,
    caption,
}: {
    className?: string;
    src: string;
    width: number;
    height: number;
    alt: string;
    caption: string;
}) {
    return (
        <figure
            className={cx(
                'h-fit overflow-hidden rounded-lg bg-gray-900 shadow-xl shadow-indigo-500/5 ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:shadow-indigo-900/20',
                className,
            )}
        >
            <div className="bg-gray-900 p-2">
                <div className="relative overflow-hidden rounded">
                    <div className="absolute inset-0 shadow-[inset_0px_0px_3px_0px_rgb(0,0,0,1)]"></div>
                    <Image src={src} alt={alt} width={width} height={height} />
                </div>
            </div>
            <div
                className={cx(
                    'px-2 pb-2 pt-2 font-handwriting text-xl text-gray-700 dark:text-gray-300',
                )}
            >
                <figcaption className="text-center">{caption}</figcaption>
            </div>
        </figure>
    );
}

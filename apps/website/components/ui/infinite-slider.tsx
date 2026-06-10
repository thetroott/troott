'use client';

import { cx } from '@/lib/utils';
import { useMotionValue, animate, motion } from 'motion/react';
import { useState, useEffect } from 'react';
import useMeasure from 'react-use-measure';

export type InfiniteSliderProps = {
    children: React.ReactNode;
    gap?: number;
    speed?: number;
    speedOnHover?: number;
    direction?: 'horizontal' | 'vertical';
    reverse?: boolean;
    className?: string;
    respectReducedMotion?: boolean;
};

function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setPrefersReducedMotion(media.matches);
        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);

    return prefersReducedMotion;
}

export function InfiniteSlider({
    children,
    gap = 16,
    speed = 100,
    speedOnHover,
    direction = 'horizontal',
    reverse = false,
    className,
    respectReducedMotion = true,
}: InfiniteSliderProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [currentSpeed, setCurrentSpeed] = useState(speed);
    const [ref, { width, height }] = useMeasure();
    const translation = useMotionValue(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [key, setKey] = useState(0);

    const shouldAnimate = !(respectReducedMotion && prefersReducedMotion);

    useEffect(() => {
        if (!shouldAnimate) {
            return;
        }

        let controls;
        const size = direction === 'horizontal' ? width : height;
        const contentSize = size + gap;
        const from = reverse ? -contentSize / 2 : 0;
        const to = reverse ? 0 : -contentSize / 2;

        const distanceToTravel = Math.abs(to - from);
        const duration = distanceToTravel / currentSpeed;

        if (isTransitioning) {
            const remainingDistance = Math.abs(translation.get() - to);
            const transitionDuration = remainingDistance / currentSpeed;

            controls = animate(translation, [translation.get(), to], {
                ease: 'linear',
                duration: transitionDuration,
                onComplete: () => {
                    setIsTransitioning(false);
                    setKey((prevKey) => prevKey + 1);
                },
            });
        } else {
            controls = animate(translation, [from, to], {
                ease: 'linear',
                duration: duration,
                repeat: Infinity,
                repeatType: 'loop',
                repeatDelay: 0,
                onRepeat: () => {
                    translation.set(from);
                },
            });
        }

        return controls?.stop;
    }, [
        key,
        translation,
        currentSpeed,
        width,
        height,
        gap,
        isTransitioning,
        direction,
        reverse,
        shouldAnimate,
    ]);

    const hoverProps =
        shouldAnimate && speedOnHover
            ? {
                  onHoverStart: () => {
                      setIsTransitioning(true);
                      setCurrentSpeed(speedOnHover);
                  },
                  onHoverEnd: () => {
                      setIsTransitioning(true);
                      setCurrentSpeed(speed);
                  },
              }
            : {};

    if (!shouldAnimate) {
        return (
            <div className={cx('overflow-hidden', className)}>
                <div
                    className="flex w-max flex-row flex-wrap items-center justify-center"
                    style={{ gap: `${gap}px` }}
                >
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className={cx('overflow-hidden', className)}>
            <motion.div
                className="flex w-max"
                style={{
                    ...(direction === 'horizontal'
                        ? { x: translation }
                        : { y: translation }),
                    gap: `${gap}px`,
                    flexDirection:
                        direction === 'horizontal' ? 'row' : 'column',
                }}
                ref={ref}
                {...hoverProps}
            >
                {children}
                {children}
            </motion.div>
        </div>
    );
}

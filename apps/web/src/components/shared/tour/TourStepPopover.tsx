import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TourStepConfig, TourStepPlacement } from './tour-steps';
import { TOUR_STEP_COUNT } from './tour-steps';
import type { SpotlightRect } from './TourOverlay';

const POPOVER_WIDTH = 381;
const GAP = 16;

interface PopoverPosition {
    top: number;
    left: number;
}

function computePopoverPosition(
    rect: SpotlightRect,
    placement: TourStepPlacement,
): PopoverPosition {
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const estimatedHeight = 256;

    let top = 0;
    let left = 0;

    if (placement === 'bottom') {
        top = rect.top + rect.height + GAP;
        left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
    } else if (placement === 'right') {
        top = rect.top + rect.height / 2 - estimatedHeight / 2;
        left = rect.left + rect.width + GAP;
    } else {
        top = rect.top - estimatedHeight - GAP;
        left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
    }

    left = Math.max(12, Math.min(left, viewportW - POPOVER_WIDTH - 12));
    top = Math.max(12, Math.min(top, viewportH - estimatedHeight - 12));

    return { top, left };
}

function caretClassName(placement: TourStepPlacement): string {
    if (placement === 'bottom') {
        return 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-b-[#405e5e] border-t-transparent';
    }
    if (placement === 'right') {
        return 'left-0 top-1/2 -translate-x-full -translate-y-1/2 border-t-transparent border-b-transparent border-r-[#405e5e] border-l-transparent';
    }
    return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-t-[#405e5e] border-b-transparent';
}

interface TourStepPopoverProps {
    step: TourStepConfig;
    stepIndex: number;
    rect: SpotlightRect;
    busy: boolean;
    onPrevious: () => void;
    onPrimary: () => void;
    onSkip: () => void;
}

const TourStepPopover: React.FC<TourStepPopoverProps> = ({
    step,
    stepIndex,
    rect,
    busy,
    onPrevious,
    onPrimary,
    onSkip,
}) => {
    const position = computePopoverPosition(rect, step.placement);

    return (
        <div
            role="dialog"
            aria-labelledby="tour-step-title"
            aria-describedby="tour-step-body"
            className="fixed z-[110] w-[381px] rounded-xl border border-[#405e5e] bg-[#333234] p-4 shadow-lg"
            style={{ top: position.top, left: position.left }}
        >
            <span
                className={cn(
                    'absolute h-0 w-0 border-[8px]',
                    caretClassName(step.placement),
                )}
                aria-hidden
            />

            <div className="flex items-start justify-between gap-3">
                <span className="inline-flex rounded-full bg-[#405e5e] px-2.5 py-0.5 font-matter text-xs font-semibold leading-[18px] tracking-[0.12px] text-[#d2e7e7]">
                    Tour &amp; Tutorial
                </span>
                <button
                    type="button"
                    onClick={onSkip}
                    disabled={busy}
                    className="font-matter text-xs leading-[18px] tracking-[0.12px] text-[#bdbdbd] hover:text-[#eaeaea] disabled:opacity-50"
                >
                    Skip tour
                </button>
            </div>

            <h2
                id="tour-step-title"
                className="mt-3 font-matter text-base font-semibold leading-6 tracking-[0.16px] text-[#eaeaea]"
            >
                {step.title}
            </h2>
            <p
                id="tour-step-body"
                className="mt-2 font-matter text-sm font-medium leading-5 tracking-[0.14px] text-[#bdbdbd]"
            >
                {step.body}
            </p>

            <div className="mt-4 border-t border-[#545454]/50 pt-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {step.showPrevious ? (
                            <button
                                type="button"
                                onClick={onPrevious}
                                disabled={busy}
                                className="font-matter text-sm font-medium leading-5 tracking-[0.14px] text-[#bdbdbd] hover:text-[#eaeaea] disabled:opacity-50"
                            >
                                Previous
                            </button>
                        ) : null}

                        <Button
                            type="button"
                            onClick={onPrimary}
                            disabled={busy}
                            className="h-9 min-w-[72px] rounded-lg bg-[#08ffdb] px-4 font-matter text-sm font-medium leading-5 tracking-[0.14px] text-[#292929] hover:bg-[#07e8c9]"
                        >
                            {busy ? 'Saving…' : step.primaryLabel}
                        </Button>
                    </div>

                    <p
                        className="shrink-0 font-matter text-xs leading-[18px] tracking-[0.12px] text-[#eaeaea]"
                        aria-live="polite"
                    >
                        {stepIndex + 1} of {TOUR_STEP_COUNT}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TourStepPopover;

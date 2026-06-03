import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
    STUDIO_EMPTY_STATE,
    studioEmptyPlacementClass,
    type StudioEmptyPlacement,
} from '@/components/shared/studio/studio-empty-state-ui';

export type StudioEmptyStateProps = {
    placement?: StudioEmptyPlacement;
    title?: string;
    description?: ReactNode;
    children?: ReactNode;
    className?: string;
    /** When true, description uses wider max-width. */
    wideDescription?: boolean;
    /** Smaller helper copy (e.g. breakdown table). */
    compactDescription?: boolean;
};

/**
 * Centered empty state — page, content region, or panel (feat-0026).
 */
export function StudioEmptyState({
    placement = 'region',
    title,
    description,
    children,
    className,
    wideDescription = false,
    compactDescription = false,
}: StudioEmptyStateProps) {
    const descriptionClass = compactDescription
        ? STUDIO_EMPTY_STATE.descriptionCompact
        : wideDescription
          ? STUDIO_EMPTY_STATE.descriptionWide
          : STUDIO_EMPTY_STATE.description;
    return (
        <div
            className={cn(studioEmptyPlacementClass(placement), className)}
            role="status"
        >
            <div className={STUDIO_EMPTY_STATE.inner}>
                {title ? (
                    <h2 className={STUDIO_EMPTY_STATE.title}>{title}</h2>
                ) : null}
                {description ? (
                    typeof description === 'string' ? (
                        <p className={descriptionClass}>{description}</p>
                    ) : (
                        <div className={descriptionClass}>{description}</div>
                    )
                ) : null}
                {children}
            </div>
        </div>
    );
}

export default StudioEmptyState;

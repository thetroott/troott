import { Loader2 } from 'lucide-react';
import { StudioPageCenter } from '@/components/shared/studio/StudioPageCenter';

type PortalRegionLoaderProps = {
    label: string;
};

/** Page-tier loader inside studio main column (feat-0036). Shell/sidebar stay mounted. */
export function PortalRegionLoader({ label }: PortalRegionLoaderProps) {
    return (
        <StudioPageCenter>
            <div
                className="flex flex-col items-center gap-4"
                aria-busy="true"
            >
                <Loader2
                    className="h-8 w-8 animate-spin text-[#9d9d9d]"
                    aria-hidden
                />
                <p
                    className="font-matter text-sm text-[#9d9d9d]"
                    role="status"
                    aria-live="polite"
                >
                    {label}
                </p>
            </div>
        </StudioPageCenter>
    );
}

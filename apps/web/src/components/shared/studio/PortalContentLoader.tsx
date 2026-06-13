import { Loader2 } from 'lucide-react';

type PortalContentLoaderProps = {
    label: string;
};

/** Region-tier loader inside list/table content areas (feat-0036). */
export function PortalContentLoader({ label }: PortalContentLoaderProps) {
    return (
        <div
            className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 py-8"
            aria-busy="true"
            role="status"
        >
            <Loader2
                className="h-8 w-8 animate-spin text-[#9d9d9d]"
                aria-hidden
            />
            <p className="font-matter text-sm text-[#9d9d9d]">{label}</p>
        </div>
    );
}

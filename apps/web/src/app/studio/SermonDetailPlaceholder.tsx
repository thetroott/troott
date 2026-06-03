import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import storage from '@/api/services/local-storage';
import { fetchSermonDetail } from '@/hooks/app/useSermon';
import { navigateOnSermonEdit } from '@/utils/sermon-edit-routing.util';
import { studioSermonEditPath } from '@/routes/paths';
import { StudioEmptyState } from '@/components/shared/studio/StudioEmptyState';
import { StudioPageCenter } from '@/components/shared/studio/StudioPageCenter';
import { toast } from 'sonner';

/**
 * Legacy sermon detail / resume routes — feat-0025 resolver (draft → wizard, published → edit).
 */
const SermonDetailPlaceholder = () => {
    const { sermonId, studioCode } = useParams<{
        sermonId: string;
        studioCode: string;
    }>();
    const navigate = useNavigate();
    const startedRef = useRef(false);

    useEffect(() => {
        const code =
            studioCode?.trim() || storage.getStudioCode()?.trim() || '';
        if (!code || !sermonId || startedRef.current) {
            return;
        }
        startedRef.current = true;

        void (async () => {
            try {
                const raw = await fetchSermonDetail(sermonId);
                const doc =
                    raw && typeof raw === 'object'
                        ? (raw as Record<string, unknown>)
                        : undefined;
                if (doc) {
                    navigateOnSermonEdit(navigate, code, sermonId, {
                        doc,
                        replace: true,
                    });
                    return;
                }
            } catch {
                toast.error('Could not open sermon.');
            }
            navigate(studioSermonEditPath(code, sermonId), { replace: true });
        })();
    }, [navigate, sermonId, studioCode]);

    return (
        <StudioPageCenter>
            <StudioEmptyState placement="page" className="min-h-[40vh]">
                <Loader2
                    className="h-8 w-8 animate-spin text-[#9d9d9d]"
                    aria-hidden
                />
                <p className="font-matter text-sm text-[#9d9d9d]">
                    Opening sermon…
                </p>
            </StudioEmptyState>
        </StudioPageCenter>
    );
};

export default SermonDetailPlaceholder;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Dashboard from '@/app/dashboard/Dashboard';
import api from '@/api/config';
import storage from '@/api/services/local-storage';
import type { StudioResponseDTO } from '@/dtos/studio.dto';

/**
 * Resolves /studio/:studioCode (id, code, or slug) then renders the studio dashboard shell.
 */
const StudioPortal = () => {
    const { studioCode } = useParams<{ studioCode: string }>();
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const segment = studioCode?.trim();
        if (!segment) {
            setError('Studio not specified');
            return;
        }

        let cancelled = false;

        void (async () => {
            const res = await api.studio.getStudio(segment);
            if (cancelled) return;

            if (res.error) {
                setError(res.message || 'Studio not found');
                return;
            }

            const studio = res.data as StudioResponseDTO | undefined;
            if (!studio?.code) {
                setError('Studio not found');
                return;
            }

            storage.setStudioCode(studio.code);
            setReady(true);
        })();

        return () => {
            cancelled = true;
        };
    }, [studioCode]);

    if (error) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center p-8 text-muted-foreground">
                {error}
            </div>
        );
    }

    if (!ready) {
        return null;
    }

    return <Dashboard />;
};

export default StudioPortal;

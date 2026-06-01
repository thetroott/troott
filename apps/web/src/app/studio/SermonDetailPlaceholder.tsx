import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import storage from '@/api/services/local-storage';
import {
    PATH_SEG_SERMONS_UPLOAD,
    studioUploadPath,
} from '@/routes/paths';

/**
 * Resume/edit routes redirect into the upload wizard with sermon context.
 */
const SermonDetailPlaceholder = () => {
    const { sermonId, studioCode } = useParams<{
        sermonId: string;
        studioCode: string;
    }>();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const code =
            studioCode?.trim() || storage.getStudioCode()?.trim() || '';
        if (!code || !sermonId) {
            return;
        }
        const isEdit = location.pathname.includes('/edit');
        navigate(studioUploadPath(code, PATH_SEG_SERMONS_UPLOAD), {
            replace: true,
            state: { resumeSermonId: sermonId, editMode: isEdit },
        });
    }, [location.pathname, navigate, sermonId, studioCode]);

    return (
        <div className="flex min-h-[40vh] items-center justify-center p-8 text-muted-foreground">
            Opening sermon…
        </div>
    );
};

export default SermonDetailPlaceholder;

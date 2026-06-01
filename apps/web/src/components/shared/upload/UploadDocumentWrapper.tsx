import { useNavigate } from 'react-router-dom';
import { DocumentVerificationModal } from '@/components/shared/upload/DocumentVerificationModal';
import { GET_STARTED_SELECTED_DOCUMENT_TYPE_KEY } from '@/utils/get-started-local-storage.util';
import {
    PATH_GET_STARTED,
    PATH_SEG_GET_STARTED_VERIFY_DOC_DOCUMENT1,
} from '@/routes/paths';

/**
 * Get Started document upload route (D4) — modal always open.
 * feat-0015: modal Continue completes milestone and routes to hub.
 */
const UploadDocumentWrapper = () => {
    const navigate = useNavigate();
    const document1Path = `${PATH_GET_STARTED}/${PATH_SEG_GET_STARTED_VERIFY_DOC_DOCUMENT1}`;

    const hasSelectedType = (() => {
        try {
            return Boolean(
                localStorage
                    .getItem(GET_STARTED_SELECTED_DOCUMENT_TYPE_KEY)
                    ?.trim(),
            );
        } catch {
            return false;
        }
    })();

    if (!hasSelectedType) {
        return (
            <p className="text-sm text-[#bdbdbd]">
                Select a document type on the first verification step, then
                return here to upload.
            </p>
        );
    }

    return (
        <DocumentVerificationModal
            open
            onOpenChange={() => {
                /* route keeps modal visible; back uses onDismiss */
            }}
            onDismiss={() => navigate(document1Path)}
        />
    );
};

export default UploadDocumentWrapper;

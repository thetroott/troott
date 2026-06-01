import { useEffect } from 'react';
import UploadEntryStepModal from '@/components/shared/upload/UploadEntryStepModal';
import { useCreateSermonEntry } from '@/hooks/upload/useCreateSermonEntry';

export interface FileUploadZoneProps {
    /** @deprecated Always uses Create sermon entry modal. */
    useEntryModal?: boolean;
    /** Open the entry modal on mount (legacy prop name). */
    autoOpenEntryModal?: boolean;
}

/**
 * @deprecated Prefer `useCreateSermonEntry` on My Sermons. Kept for compatibility:
 * only renders the same `UploadEntryStepModal` as Create sermon.
 */
const FileUploadZone: React.FC<FileUploadZoneProps> = ({
    autoOpenEntryModal = false,
}) => {
    const {
        entryModalOpen,
        setEntryModalOpen,
        onFileSelected,
        isLoading,
        startUploadFlow,
    } = useCreateSermonEntry();

    useEffect(() => {
        if (autoOpenEntryModal) {
            startUploadFlow();
        }
    }, [autoOpenEntryModal, startUploadFlow]);

    return (
        <UploadEntryStepModal
            open={entryModalOpen}
            onOpenChange={setEntryModalOpen}
            isLoading={isLoading}
            onFileSelected={onFileSelected}
        />
    );
};

export default FileUploadZone;

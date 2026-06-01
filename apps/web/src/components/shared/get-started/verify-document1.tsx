import { useState } from 'react';
import { Camera, CloudUpload } from 'lucide-react';
import { toast } from 'sonner';

import { DocumentVerificationModal } from '@/components/shared/upload/DocumentVerificationModal';
import { GET_STARTED_SELECTED_DOCUMENT_TYPE_KEY } from '@/utils/get-started-local-storage.util';

import IconRadioSelect from './IconRadioSelect';

const VerifyDocument1 = () => {
    const [method, setMethod] = useState('take-picture');
    const [showUploadDialog, setShowUploadDialog] = useState(false);

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

    const handleMethodChange = (value: string) => {
        setMethod(value);
        if (value === 'upload-photos') {
            if (!hasSelectedType) {
                toast.error(
                    'Select a document type on the first step before uploading.',
                );
                return;
            }
            setShowUploadDialog(true);
        }
    };

    return (
        <>
            <div className="text-sm text-[#eaeaea]">
                <p>Upload Method</p>
            </div>

            <div className="mt-2">
                <IconRadioSelect
                    variant="get-started-document"
                    value={method}
                    onChange={handleMethodChange}
                    options={[
                        {
                            label: 'Take picture with phone',
                            value: 'take-picture',
                            icon: <Camera className="h-6 w-6" />,
                        },
                        {
                            label: 'Upload photos',
                            value: 'upload-photos',
                            icon: <CloudUpload className="h-6 w-6" />,
                        },
                    ]}
                />
            </div>

            <DocumentVerificationModal
                open={showUploadDialog}
                onOpenChange={setShowUploadDialog}
            />
        </>
    );
};

export default VerifyDocument1;

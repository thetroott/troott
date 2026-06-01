import { useEffect, useState } from 'react';
import { FaIdCard, FaPassport } from 'react-icons/fa';

import {
    normalizeDocumentUiType,
    readSelectedDocumentUiType,
} from '@/hooks/app/useDocumentVerification';
import {
    GET_STARTED_SELECTED_DOCUMENT_TYPE_KEY,
    GET_STARTED_UPLOADED_DOCUMENTS_KEY,
} from '@/utils/get-started-local-storage.util';

import IconRadioSelect from './IconRadioSelect';

const SelectDocumentType = () => {
    const [documentType, setDocumentType] = useState(() =>
        readSelectedDocumentUiType(),
    );

    useEffect(() => {
        try {
            localStorage.setItem(
                GET_STARTED_SELECTED_DOCUMENT_TYPE_KEY,
                documentType,
            );
        } catch {
            /* ignore */
        }
    }, [documentType]);

    const handleDocumentTypeChange = (value: string) => {
        const next = normalizeDocumentUiType(value);
        if (next !== documentType) {
            try {
                localStorage.removeItem(GET_STARTED_UPLOADED_DOCUMENTS_KEY);
            } catch {
                /* ignore */
            }
        }
        setDocumentType(next);
    };

    return (
        <>
            <div className="text-base text-muted-foreground">
                <p>Document Type</p>
            </div>

            <div className="mt-2">
                <IconRadioSelect
                    variant="get-started-document"
                    value={documentType}
                    onChange={handleDocumentTypeChange}
                    options={[
                        {
                            label: 'National Identity Number (NIN)',
                            value: 'nin',
                            icon: <FaIdCard className="h-5 w-5" />,
                        },
                        {
                            label: "Driver's License",
                            value: 'drivers-license',
                            icon: <FaIdCard className="h-5 w-5" />,
                        },
                        {
                            label: 'International Passport',
                            value: 'passport',
                            icon: <FaPassport className="h-5 w-5" />,
                        },
                    ]}
                />
            </div>
        </>
    );
};

export default SelectDocumentType;

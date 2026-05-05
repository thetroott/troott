import React, { useState } from 'react';
import { DocumentType } from './types/document-types';
import FinalStep from './FinalStep';
import { Button } from '@/components/ui/button';
import { IdCardIcon, FileText } from 'lucide-react';

const DocumentUploadWrapper = ({
    initialDocumentType,
}: {
    initialDocumentType?: DocumentType;
}) => {
    const [documentType, setDocumentType] = useState<DocumentType | null>(
        initialDocumentType || null,
    );

    const documentOptions: Array<{
        type: DocumentType;
        label: string;
        icon: React.ReactNode;
        description: string;
    }> = [
        {
            type: 'driver-license',
            label: 'Driver License',
            icon: <IdCardIcon className="w-6 h-6" />,
            description: 'Upload front and back of your driver license',
        },
        {
            type: 'passport-file',
            label: 'Passport',
            icon: <FileText className="w-6 h-6" />,
            description: 'Upload the photo page of your passport',
        },
        {
            type: 'nin',
            label: 'National ID (NIN)',
            icon: <IdCardIcon className="w-6 h-6" />,
            description: 'Upload your National Identification Number card',
        },
        {
            type: 'international-passport',
            label: 'International Passport',
            icon: <FileText className="w-6 h-6" />,
            description: 'Upload your international passport photo page',
        },
    ];

    if (documentType) {
        return (
            <div className="w-full">
                <div className="mb-4 flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setDocumentType(null)}
                        className="text-sm"
                    >
                        Change Document Type
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Uploading:{' '}
                        {
                            documentOptions.find(
                                (opt) => opt.type === documentType,
                            )?.label
                        }
                    </div>
                </div>
                <FinalStep documentType={documentType} />
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-7">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">
                    Select Document Type
                </h2>
                <p className="text-muted-foreground">
                    Choose the type of document you want to upload
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentOptions.map((option) => (
                    <div
                        key={option.type}
                        className="cursor-pointer hover:shadow-md transition-shadow border rounded-lg p-4 bg-white"
                        onClick={() => setDocumentType(option.type)}
                    >
                        <div className="pb-3">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    {option.icon}
                                </div>
                                <h3 className="text-lg font-semibold">
                                    {option.label}
                                </h3>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {option.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentUploadWrapper;

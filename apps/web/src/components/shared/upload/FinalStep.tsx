import React from 'react';
import { DocumentType, FinalStepProps } from './types/document-types';
import DriverLicenseUpload from './components/DriverLicenseUpload';
import PassportUpload from './components/PassportUpload';
import InternationalPassportUpload from './components/InternationalPassportUpload';

// Document component mapping
const documentComponents: Record<DocumentType, React.FC> = {
    'driver-license': DriverLicenseUpload,
    'passport-file': PassportUpload,
    nin: DriverLicenseUpload, // Using driver license component as fallback for NIN
    'international-passport': InternationalPassportUpload, // Using dedicated international passport component
};

function FinalStep({ documentType }: FinalStepProps) {
    if (!documentType) {
        return (
            <div className="w-full max-w-2xl mx-auto p-7 text-center">
                <div className="text-lg font-medium text-muted-foreground">
                    Please select a document type
                </div>
            </div>
        );
    }

    const Component = documentComponents[documentType];

    return <Component />;
}

export default FinalStep;

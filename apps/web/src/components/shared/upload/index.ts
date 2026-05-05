// Main components
export { default as DocumentUploadWrapper } from './DocumentUploadWrapper';
export { default as FinalStep } from './FinalStep';

// Individual document upload components
export { default as DriverLicenseUpload } from './components/DriverLicenseUpload';
export { default as PassportUpload } from './components/PassportUpload';
export { default as InternationalPassportUpload } from './components/InternationalPassportUpload';

// Types
export type { DocumentType, FinalStepProps } from './types/document-types';

// Legacy components (for backward compatibility)
export { default as UploadDocumentWrapper } from './UploadDocumentWrapper';
export {
    FileUploadDialog,
    type UploadConfig,
    type UploadField,
} from './file-upload';

import { useState } from 'react';
import IconRadioSelect from './IconRadioSelect';
import { FileUploadDialog } from '../upload/file-upload';
import { Camera, Upload, IdCardIcon, ImageIcon, FileText } from 'lucide-react';

const VerifyDocument1 = () => {
    const [contactType, setContactType] = useState('take-picture');
    const [showUploadDialog, setShowUploadDialog] = useState(false);

    // Get document type from localStorage (set by SelectDocumentType)
    const documentType =
        localStorage.getItem('selectedDocumentType') || 'driver-license';

    const handleContactTypeChange = (value: string) => {
        setContactType(value);
        if (value === 'upload-photos') {
            setShowUploadDialog(true);
        }
    };

    const handleFileUpload = (frontFile: File, backFile: File) => {
        console.log('Files uploaded:', {
            frontFile: frontFile.name,
            backFile: backFile.name,
        });
        // Handle file upload logic here
    };

    return (
        <>
            <div className="text-base text-muted-foreground mt-6">
                <p>Upload Method</p>
            </div>

            <div className="mt-2">
                <IconRadioSelect
                    value={contactType}
                    onChange={handleContactTypeChange}
                    options={[
                        {
                            label: 'Take picture with phone',
                            value: 'take-picture',
                            icon: <Camera className="w-5 h-5" />,
                        },
                        {
                            label: 'Upload photos',
                            value: 'upload-photos',
                            icon: <Upload className="w-5 h-5" />,
                        },
                    ]}
                />
            </div>

            <FileUploadDialog
                open={showUploadDialog}
                onOpenChange={setShowUploadDialog}
                config={{
                    title:
                        documentType === 'passport'
                            ? 'International Passport Verification'
                            : 'Driver License Verification',
                    description:
                        documentType === 'passport'
                            ? 'Make sure that photo page of your international passport is clear and shows your <br/> personal details, photo, and passport number.'
                            : "Make sure photos aren't blurry and the front of your <br/> driver's license clearly shows your face.",
                    fields:
                        documentType === 'passport'
                            ? [
                                  {
                                      id: 'passport_page',
                                      label: 'Upload International Passport Page',
                                      uploadText:
                                          'Upload International Passport Photo Page',
                                      acceptedFormats: [
                                          'image/jpeg',
                                          'image/png',
                                          'application/pdf',
                                      ],
                                      icon: FileText,
                                      alt: 'International passport photo page',
                                      required: true,
                                  },
                              ]
                            : [
                                  {
                                      id: 'front',
                                      label: 'Upload Front',
                                      uploadText: 'Upload Front',
                                      acceptedFormats: [
                                          'image/jpeg',
                                          'image/png',
                                      ],
                                      icon: IdCardIcon,
                                      alt: 'Front of document',
                                      required: true,
                                  },
                                  {
                                      id: 'back',
                                      label: 'Upload back',
                                      uploadText: 'Upload back',
                                      acceptedFormats: [
                                          'image/jpeg',
                                          'image/png',
                                      ],
                                      icon: ImageIcon,
                                      alt: 'Back of document',
                                      required: true,
                                  },
                              ],
                    submitButtonText: 'Continue',
                    onSubmit: (files) => {
                        if (documentType === 'passport') {
                            const passportFile = files.passport_page;
                            if (passportFile) {
                                console.log(
                                    'International passport uploaded:',
                                    passportFile.name,
                                );
                                // Store in localStorage for international passport
                                const fileData = {
                                    passport_page: {
                                        name: passportFile.name,
                                        size: passportFile.size,
                                        type: passportFile.type,
                                        url: URL.createObjectURL(passportFile),
                                    },
                                };
                                localStorage.setItem(
                                    'internationalPassportDocuments',
                                    JSON.stringify(fileData),
                                );
                            }
                        } else {
                            const frontFile = files.front;
                            const backFile = files.back;
                            if (frontFile && backFile) {
                                handleFileUpload(frontFile, backFile);
                            }
                        }
                    },
                }}
            />
        </>
    );
};

export default VerifyDocument1;

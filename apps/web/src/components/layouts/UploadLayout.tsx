import React from 'react';
import UploadOptions from '@/components/shared/upload/UploadOptions';
import FeedSection from '@/components/shared/upload/FeedSection';
import { useUpload } from '@/context/upload/upload.context';

interface UploadLayoutProps {
    children: React.ReactNode;
    /** When the minister already has sermons, feed copy reflects a non-empty studio. */
    feedHasSermons?: boolean;
}

const UploadLayout: React.FC<UploadLayoutProps> = ({
    children,
    feedHasSermons = false,
}) => {
    const { state } = useUpload();
    const { activeOption = 'upload' } = state;

    return (
        <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
            <UploadOptions />

            <div className="min-h-0 min-w-0 flex-1 overflow-auto">
                <div className="w-full min-w-0 pb-5">
                    <div className="flex w-full min-w-0 flex-col space-y-8">
                        <div className="w-full min-w-0 px-4 md:px-6">
                            {children}
                        </div>

                        {activeOption === 'upload' && (
                            <div className="w-full min-w-0 px-4 md:px-6">
                                <FeedSection hasSermons={feedHasSermons} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadLayout;

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
        <div className="min-h-screen ">
            {/* Upload Options */}
            <UploadOptions />

            {/* Main Content - Responsive layout with scrolling */}
            {/* Clear fixed `UploadOptions` rail (~nav 60 + divider + py-3 + 70px chip min). */}
            <div className="pt-[136px]">
                <div className="container px-4 md:px-6 pb-5 max-w-7xl mx-auto">
                    <div className="flex flex-col items-center space-y-8">
                        {/* Upload Section - Top Half */}
                        <div className="flex items-center justify-center w-full">
                            <div className="w-full max-w-6xl mx-auto">
                                {children}
                            </div>
                        </div>

                        {/* Feed Section - Bottom Half - Only show for upload tab */}
                        {activeOption === 'upload' && (
                            <div className="w-full max-w-6xl mx-auto">
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

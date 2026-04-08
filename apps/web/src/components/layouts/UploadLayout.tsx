import React from "react";
import UploadOptions from "@/components/shared/upload/UploadOptions";
import FeedSection from "@/components/shared/upload/FeedSection";
import { useUpload } from "@/context/upload/upload.context";

interface UploadLayoutProps {
  children: React.ReactNode;
}

const UploadLayout: React.FC<UploadLayoutProps> = ({ children }) => {
  const { state } = useUpload();
  const showFeed = state.activeOption === "upload";

  return (
    <div className="min-h-screen">
      <UploadOptions />

      <div className="pt-[140px] min-h-screen">
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
          <div className="space-y-8">
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="w-full max-w-3xl mx-auto">{children}</div>
            </div>

            {showFeed && (
              <div className="w-full">
                <FeedSection />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadLayout;

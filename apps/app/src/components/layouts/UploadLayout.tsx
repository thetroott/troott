import React from "react";
import UploadOptions from "@/components/shared/upload/UploadOptions";
import FeedSection from "@/components/shared/upload/FeedSection";

interface UploadLayoutProps {
  children: React.ReactNode;
}

const UploadLayout: React.FC<UploadLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Upload Options */}
      <UploadOptions />

      {/* Main Content - Responsive layout with scrolling */}
      <div className="pt-[140px] min-h-screen">
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
          <div className="space-y-8">
            {/* Upload Section - Top Half */}
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="w-full max-w-2xl mx-auto">{children}</div>
            </div>

            {/* Feed Section - Bottom Half */}
            <div className="w-full">
              <FeedSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadLayout;

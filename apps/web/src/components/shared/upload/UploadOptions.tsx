import React from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useUpload, uploadActions } from "@/context/upload/upload.context";

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img 
    src="/images/assets/upload-icon.svg" 
    alt="Upload"
    className={className}
  />
);
const ImportIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img 
    src="/images/assets/import-inactive.svg" 
    alt="Import"
    className={className}
  />
);
const CreateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img 
    src="/images/assets/create-inactive.svg" 
    alt="Create"
    className={className}
  />
);
const InsightsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img 
    src="/images/assets/insights-inactive.svg" 
    alt="Insights"
    className={className}
  />
);
const CreatorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img 
    src="/images/assets/creator-inactive.svg" 
    alt="Creator"
    className={className}
  />
);

const UploadOptions: React.FC = () => {
  const { open: sidebarOpen, isMobile } = useSidebar();
  const { state, dispatch } = useUpload();
  const { activeOption = 'upload' } = state;

  const handleOptionClick = (optionId: string) => {
    dispatch(uploadActions.setActiveOption(optionId));
  };

  const options = [
    {
      id: "upload",
      title: "Upload from computer",
      icon: UploadIcon,
    },
    {
      id: "import",
      title: "Import from Drive and more",
      icon: ImportIcon,
      isActive: false,
    },
    {
      id: "create",
      title: "Start Creating from Scratch",
      icon: CreateIcon,
      isActive: false,
    },
    {
      id: "performing",
      title: "View Top Performing Clip",
      icon: InsightsIcon,
      isActive: false,
    },
    {
      id: "tip",
      title: "Creator Tip of the Week",
      icon: CreatorIcon,
      isActive: false,
    },
  ];

  return (
    <div
      className="fixed top-[60px] bg-[#171717] w-full z-[1]"
      style={{
        left: !isMobile ? (sidebarOpen ? "240px" : "48px") : "0px",
        width: !isMobile
          ? sidebarOpen
            ? "calc(100% - 240px)"
            : "calc(100% - 48px)"
          : "100%",
      }}
    >
      <div className={` border-b border-border/50 ml-4 mr-6 mt-4 rounded-t-lg ${
        !isMobile
          ? sidebarOpen
            ? "md:ml-13 md:mr-9"
            : "md:ml-9 md:mr-9"
          : ""
      }`}>
        <div className="container mx-auto px-6 md:px-8 py-4 max-w-4xl">
          <div className="min-h-[62px] flex items-center justify-center">
            {/* Desktop Layout */}
            <div className="hidden md:flex items-center   gap-6 h-full justify-center">
              {options.map((option) => {
                const IconComponent = option.icon;
                const isActive = activeOption === option.id;
                return (
                  <div key={option.id} className="relative flex flex-col">
                    <Button
                      onClick={() => handleOptionClick(option.id)}
                      variant={isActive ? "upload" : "ghost"}
                      className={`
                flex items-center  min-w-[207px] min-h-[70px] border-1 cursor-pointer p-4 justify-center gap-2 h-auto rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-[#1a1a1a] text-white "
                }
              `}
                    >
                      <IconComponent className="h-[32px] w-[32px]" />
                      <span className="text-xs font-medium whitespace-nowrap leading-[18px]">
                        {option.title} 
                      </span>
                    </Button>
                   
                  </div>
                );
              })}
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden">
              <div className="flex flex-wrap gap-2 justify-center">
                {options.map((option) => {
                  const IconComponent = option.icon;
                  const isActive = activeOption === option.id;
                  return (
                    <Button
                      key={option.id}
                      onClick={() => handleOptionClick(option.id)}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`
                      flex items-center gap-2 h-10 px-3 rounded-lg transition-all duration-200
                      ${
                        isActive
                          ? "bg-[#E0E0E0] text-[#1a1a1a] hover:bg-[#E0E0E0]/90"
                          : "bg-[#333333] text-white hover:bg-[#404040]"
                      }
                    `}
                    >
                      <IconComponent className="h-[32px] w-[32px]" />
                      <span className="text-xs font-medium leading-[18px]">
                        {option.title}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadOptions;

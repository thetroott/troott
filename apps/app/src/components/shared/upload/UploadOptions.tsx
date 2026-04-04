import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, Scissors, BarChart3, Star } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

const UploadOptions: React.FC = () => {
  const { open: sidebarOpen, isMobile } = useSidebar();

  const options = [
    {
      id: "upload",
      title: "Upload from computer",
      icon: Upload,
      isActive: true,
    },
    {
      id: "import",
      title: "Import from Drive and more",
      icon: Download,
      isActive: false,
    },
    {
      id: "create",
      title: "Start Creating from Scratch",
      icon: Scissors,
      isActive: false,
    },
    {
      id: "performing",
      title: "View Top Performing Clip",
      icon: BarChart3,
      isActive: false,
    },
    {
      id: "tip",
      title: "Creator Tip of the Week",
      icon: Star,
      isActive: false,
    },
  ];

  return (
    <div
      className="fixed top-[60px] w-full z-[1]"
      style={{
        left: !isMobile ? (sidebarOpen ? "240px" : "48px") : "0px",
        width: !isMobile
          ? sidebarOpen
            ? "calc(100% - 240px)"
            : "calc(100% - 48px)"
          : "100%",
      }}
    >
      <div className={`bg-background border-b border-border/50 ml-4 mr-6 mt-4 rounded-t-lg ${
        !isMobile
          ? sidebarOpen
            ? "md:ml-13 md:mr-9"
            : "md:ml-9 md:mr-9"
          : ""
      }`}>
        <div className="container mx-auto px-6 md:px-8 py-4 max-w-4xl">
          <div className="min-h-[62px] flex items-center justify-center">
            {/* Desktop Layout */}
            <div className="hidden md:flex items-center gap-3 h-full justify-center">
              {options.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Button
                    key={option.id}
                    variant={option.isActive ? "default" : "ghost"}
                    className={`
                flex items-center justify-center gap-2 h-10 px-3 rounded-lg transition-all duration-200
                ${
                  option.isActive
                    ? "bg-foreground text-background hover:bg-foreground/90 shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              `}
                  >
                    <IconComponent className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium whitespace-nowrap">
                      {option.title}
                    </span>
                  </Button>
                );
              })}
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden">
              <div className="flex flex-wrap gap-2 justify-center">
                {options.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <Button
                      key={option.id}
                      variant={option.isActive ? "default" : "ghost"}
                      size="sm"
                      className={`
                      flex items-center gap-2 h-10 px-3 rounded-lg transition-all duration-200
                      ${
                        option.isActive
                          ? "bg-foreground text-background hover:bg-foreground/90 shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }
                    `}
                    >
                      <IconComponent className="h-3 w-3" />
                      <span className="text-xs font-medium">
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

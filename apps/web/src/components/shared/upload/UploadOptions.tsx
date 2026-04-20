import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useUpload, uploadActions } from '@/context/upload/upload.context';
import { cn } from '@/lib/utils';
import { UPLOAD_OPTIONS_BAR } from '@/components/shared/upload/upload-studio-ui';

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img
    src="/images/assets/upload-icon.svg"
    alt=""
    className={className}
    aria-hidden
  />
);
const ImportIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img
    src="/images/assets/import-inactive.svg"
    alt=""
    className={className}
    aria-hidden
  />
);
const CreateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img
    src="/images/assets/create-inactive.svg"
    alt=""
    className={className}
    aria-hidden
  />
);
const InsightsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img
    src="/images/assets/insights-inactive.svg"
    alt=""
    className={className}
    aria-hidden
  />
);
const CreatorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img
    src="/images/assets/creator-inactive.svg"
    alt=""
    className={className}
    aria-hidden
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
      id: 'upload',
      title: 'Upload from computer',
      icon: UploadIcon,
    },
    {
      id: 'import',
      title: 'Import from Drive and more',
      icon: ImportIcon,
    },
    {
      id: 'create',
      title: 'Start Creating from Scratch',
      icon: CreateIcon,
    },
    {
      id: 'performing',
      title: 'View Top Performing Clip',
      icon: InsightsIcon,
    },
    {
      id: 'tip',
      title: 'Creator Tip of the Week',
      icon: CreatorIcon,
    },
  ];

  return (
    <div
      className={cn('fixed top-[60px] z-[1] w-full', UPLOAD_OPTIONS_BAR.railBg)}
      style={{
        left: !isMobile ? (sidebarOpen ? '240px' : '48px') : '0px',
        width: !isMobile
          ? sidebarOpen
            ? 'calc(100% - 240px)'
            : 'calc(100% - 48px)'
          : '100%',
      }}
    >
      <div className={UPLOAD_OPTIONS_BAR.railDivider}>
        <div className={UPLOAD_OPTIONS_BAR.inner}>
          <div
            className={UPLOAD_OPTIONS_BAR.chipRow}
            role="tablist"
            aria-label="Upload source"
          >
            {options.map((option) => {
              const IconComponent = option.icon;
              const isActive = activeOption === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-pressed={isActive}
                  onClick={() => handleOptionClick(option.id)}
                  className={cn(
                    UPLOAD_OPTIONS_BAR.chipBase,
                    isActive
                      ? UPLOAD_OPTIONS_BAR.chipActive
                      : UPLOAD_OPTIONS_BAR.chipInactive,
                  )}
                >
                  <IconComponent className={UPLOAD_OPTIONS_BAR.icon} />
                  <span
                    className={cn(
                      UPLOAD_OPTIONS_BAR.label,
                      isActive
                        ? UPLOAD_OPTIONS_BAR.labelActive
                        : UPLOAD_OPTIONS_BAR.labelInactive,
                    )}
                  >
                    {option.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadOptions;

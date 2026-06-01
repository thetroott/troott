import React from 'react';
import { useUpload, uploadActions } from '@/context/upload/uploadState';
import { cn } from '@/lib/utils';
import { UPLOAD_OPTIONS_BAR } from '@/components/shared/upload/upload-studio-ui';
import { useCreateSermonEntry } from '@/hooks/upload/useCreateSermonEntry';
import { useTour } from '@/components/shared/tour/TourProvider';

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
    const { state, dispatch } = useUpload();
    const { activeOption = 'upload' } = state;
    const { active: tourActive } = useTour();
    const { startUploadFlow } = useCreateSermonEntry();

    const handleOptionClick = (optionId: string) => {
        if (optionId === 'upload') {
            startUploadFlow();
            return;
        }
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
            className={cn(
                'sticky top-0 z-10 w-full min-w-0 shrink-0',
                UPLOAD_OPTIONS_BAR.railBg,
            )}
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
                            const isActive =
                                !tourActive && activeOption === option.id;
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    aria-pressed={isActive}
                                    data-tour={
                                        option.id === 'upload'
                                            ? 'upload-from-computer'
                                            : undefined
                                    }
                                    onClick={() => handleOptionClick(option.id)}
                                    className={cn(
                                        UPLOAD_OPTIONS_BAR.chipBase,
                                        isActive
                                            ? UPLOAD_OPTIONS_BAR.chipActive
                                            : UPLOAD_OPTIONS_BAR.chipInactive,
                                    )}
                                >
                                    <IconComponent
                                        className={UPLOAD_OPTIONS_BAR.icon}
                                    />
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

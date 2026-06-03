import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    BarChart3,
    Captions,
    Clapperboard,
    Copyright,
    FileText,
    MessageSquare,
    Scissors,
    Settings,
} from 'lucide-react';
import { SERMON_EDIT } from '@/components/shared/sermon/sermon-edit-ui';
import { SermonListAudioGlyph } from '@/components/shared/my-sermons/my-sermons-ui';
import { PATH_SETTINGS } from '@/routes/paths';
import { cn } from '@/lib/utils';

export type SermonEditNavSection = 'details' | 'analytics';

type SermonEditSidebarProps = {
    listPath: string;
    detailsPath: string;
    detailsPathState?: Record<string, unknown>;
    analyticsPath: string;
    sermonTitle: string;
    thumbnailPreview?: string;
    activeSection: SermonEditNavSection;
    onReplaceAudio: () => void;
};

type NavItemProps = {
    icon: ReactNode;
    label: string;
    active?: boolean;
    disabled?: boolean;
    title?: string;
    onClick?: () => void;
    to?: string;
    state?: Record<string, unknown>;
};

function NavItem({
    icon,
    label,
    active = false,
    disabled = false,
    title,
    onClick,
    to,
    state,
}: NavItemProps) {
    const className = cn(
        SERMON_EDIT.sidebarNavItem,
        active && SERMON_EDIT.sidebarNavItemActive,
        disabled && SERMON_EDIT.sidebarNavItemDisabled,
    );

    const inner = (
        <>
            <span className={SERMON_EDIT.sidebarNavIcon} aria-hidden>
                {icon}
            </span>
            <span className="truncate">{label}</span>
        </>
    );

    if (active) {
        return (
            <div className={className} aria-current="page">
                {inner}
            </div>
        );
    }

    if (to && !disabled) {
        return (
            <Link to={to} state={state} className={className} title={title}>
                {inner}
            </Link>
        );
    }

    return (
        <button
            type="button"
            className={className}
            disabled={disabled}
            title={title}
            onClick={onClick}
        >
            {inner}
        </button>
    );
}

/**
 * In-page edit nav (Figma `11574:98157` / YouTube Studio “Channel content” column).
 * Not the global `AppSidebar` — that stays hidden on the edit route.
 */
export function SermonEditSidebar({
    listPath,
    detailsPath,
    detailsPathState,
    analyticsPath,
    sermonTitle,
    thumbnailPreview,
    activeSection,
    onReplaceAudio,
}: SermonEditSidebarProps) {
    return (
        <aside className={SERMON_EDIT.sidebar} aria-label="Sermon editor">
            <Link to={listPath} className={SERMON_EDIT.sidebarBack}>
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                <span>My Sermons</span>
            </Link>

            <div className={SERMON_EDIT.sidebarPreview}>
                <div className={SERMON_EDIT.sidebarThumb}>
                    {thumbnailPreview ? (
                        <img
                            src={thumbnailPreview}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <SermonListAudioGlyph size="sm" />
                        </div>
                    )}
                </div>
                <p className={SERMON_EDIT.sidebarPreviewLabel}>Your sermon</p>
                <p className={SERMON_EDIT.sidebarPreviewTitle} title={sermonTitle}>
                    {sermonTitle}
                </p>
            </div>

            <nav className={SERMON_EDIT.sidebarNav} aria-label="Sermon sections">
                <NavItem
                    icon={<FileText className="h-4 w-4" />}
                    label="Details"
                    to={detailsPath}
                    state={detailsPathState}
                    active={activeSection === 'details'}
                />
                <NavItem
                    icon={<BarChart3 className="h-4 w-4" />}
                    label="Analytics"
                    to={analyticsPath}
                    active={activeSection === 'analytics'}
                />
                <NavItem
                    icon={<Scissors className="h-4 w-4" />}
                    label="Editor"
                    title="Replace or upload audio"
                    onClick={onReplaceAudio}
                />
                <NavItem
                    icon={<MessageSquare className="h-4 w-4" />}
                    label="Comments"
                    disabled
                    title="Coming soon"
                />
                <NavItem
                    icon={<Captions className="h-4 w-4" />}
                    label="Subtitles"
                    disabled
                    title="Coming soon"
                />
                <NavItem
                    icon={<Copyright className="h-4 w-4" />}
                    label="Copyright"
                    disabled
                    title="Coming soon"
                />
                <NavItem
                    icon={<Clapperboard className="h-4 w-4" />}
                    label="Clips"
                    disabled
                    title="Coming soon"
                />
            </nav>

            <div className={SERMON_EDIT.sidebarFooter}>
                <Link to={PATH_SETTINGS} className={SERMON_EDIT.sidebarFooterLink}>
                    <Settings className="h-4 w-4 shrink-0" aria-hidden />
                    Settings
                </Link>
            </div>
        </aside>
    );
}

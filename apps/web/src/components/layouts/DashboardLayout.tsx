import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DraftProvider } from '@/context/draft/draftState';
import { UploadProvider } from '@/context/upload/uploadState';
import { SidebarProvider } from '../ui/sidebar';
import AppSidebar from '../shared/navigation/Sidebar';
import storage from '@/api/services/local-storage';
import NavBar from '../shared/navigation/NavBar';
import { cn } from '@/lib/utils';
import { UserType } from '@/models/User.model';
import { ObservabilityUserSync } from '@/services/observability/ObservabilityUserSync';
import cookieService from '@/api/services/cookies';
import { normalizePortalUserType } from '@/utils/roles.util';
import { PATH_STUDIO_PREFIX } from '@/routes/paths';
import TourProvider from '@/components/shared/tour/TourProvider';

const MY_SERMONS_CANVAS_BG = 'bg-[#2b2a2c]';

function sidebarUserTypeFromCookie(): UserType {
    return normalizePortalUserType(cookieService.getUserType());
}

const DashboardLayout = () => {
    const { pathname } = useLocation();
    const normalizedPath = pathname.replace(/\/+$/, '') || '/';
    const hideTopNav = /\/studio\/[^/]+\/sermons/.test(pathname);
    const shellBg = hideTopNav ? MY_SERMONS_CANVAS_BG : 'bg-neutral-900';
    const studioHome =
        normalizedPath.startsWith(`${PATH_STUDIO_PREFIX}/`) &&
        !normalizedPath.slice(`${PATH_STUDIO_PREFIX}/`.length).includes('/', 1);

    const [defaultOpen] = React.useState(() => {
        const stored = storage.fetch('sidebar-collapsed');
        return stored ? stored !== 'true' : true;
    });

    return (
        <TourProvider>
        <SidebarProvider
            defaultOpen={defaultOpen}
            className={cn('h-full min-h-0 min-w-0 flex-1', shellBg)}
        >
            <ObservabilityUserSync />
            <div
                className={cn(
                    'flex h-full min-h-0 min-w-0 w-full flex-1 overflow-hidden',
                    shellBg,
                )}
            >
                <AppSidebar userRole={sidebarUserTypeFromCookie()} />

                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    {!hideTopNav ? <NavBar /> : null}
                    <main
                        className={cn(
                            'flex min-h-0 flex-1 flex-col',
                            hideTopNav ? 'overflow-hidden' : 'overflow-auto',
                            shellBg,
                            hideTopNav
                                ? 'p-0'
                                : studioHome
                                  ? 'px-0 pb-4 pt-2'
                                  : 'px-4 pb-4 pt-2 md:px-6',
                        )}
                    >
                        <DraftProvider>
                            <UploadProvider>
                                <Outlet />
                            </UploadProvider>
                        </DraftProvider>
                    </main>
                </div>
            </div>
        </SidebarProvider>
        </TourProvider>
    );
};

export default DashboardLayout;

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '../ui/sidebar';
import AppSidebar from '../shared/navigation/Sidebar';
import storage from '@/utils/storage.util';
import NavBar from '../shared/navigation/NavBar';
import { cn } from '@/lib/utils';
import { UserType } from '@troott/api-client';

/** My Sermons matches Figma [`10154:35083`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10154-35083) — no global top nav; shell fill `#2b2a2c` (not theme `neutral-900`). */
/** My Sermons list — full canvas, no top nav (see Figma note above). */
const MY_SERMONS_PATHS = new Set(['/sermons', '/get-sermons', '/my-sermon']);

/** Figma frame fill for node `10154:35083` / `Frame 1618868833`. */
const MY_SERMONS_CANVAS_BG = 'bg-[#2b2a2c]';

const DashboardLayout = () => {
    const { pathname } = useLocation();
    const normalizedPath = pathname.replace(/\/+$/, '') || '/';
    const hideTopNav = MY_SERMONS_PATHS.has(normalizedPath);
    const shellBg = hideTopNav ? MY_SERMONS_CANVAS_BG : 'bg-neutral-900';
    /** Studio upload page — stretch content to the sidebar column (no double horizontal inset). */
    const dashboardFullWidthMain = normalizedPath === '/dashboard';

    const [defaultOpen] = React.useState(() => {
        const stored = storage.fetch('sidebar-collapsed');
        return stored ? stored !== 'true' : true;
    });

    return (
        <SidebarProvider
            defaultOpen={defaultOpen}
            className={cn('h-full min-h-0 min-w-0 flex-1', shellBg)}
        >
            <div
                className={cn(
                    'flex h-full min-h-0 min-w-0 w-full flex-1 overflow-hidden',
                    shellBg,
                )}
            >
                <AppSidebar userRole={UserType.MINISTER} />

                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    {!hideTopNav ? <NavBar /> : null}
                    <main
                        className={cn(
                            'flex min-h-0 flex-1 flex-col',
                            hideTopNav ? 'overflow-hidden' : 'overflow-auto',
                            shellBg,
                            hideTopNav
                                ? 'p-0'
                                : dashboardFullWidthMain
                                  ? 'px-0 pb-4 pt-2'
                                  : 'px-4 pb-4 pt-2 md:px-6',
                        )}
                    >
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default DashboardLayout;

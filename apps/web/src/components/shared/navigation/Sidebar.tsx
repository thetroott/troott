import React, { useMemo } from 'react';
import { navFooterItems, navItems } from '@/_data/navdata';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { SearchForm } from '../dialog/Search.tsx';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    isStudioHomePath,
    isStudioScopedLegacyNavUrl,
    resolveStudioNavUrl,
} from '@/utils/studio-nav.util';
import { Separator } from '@/components/ui/separator.tsx';
import { UserType } from '@/models/User.model';
import useAuth from '@/hooks/app/useAuth';
import useContextType from '@/hooks/shared/useContextType';
import { useMinister } from '@/context/minister/useMinister';
import { useCreator } from '@/context/creator/useCreator';
import {
    isHiddenNavItem,
    isSidebarGroupVisibleForUser,
    type SidebarNavItemLike,
} from '@/utils/sidebar-nav.util';
import { shouldShowGetStartedNavItem } from '@/utils/portal-onboarding.util';
import { shouldRedirectStudioNavForOnboarding } from '@/utils/hub-onboarding.util';
import { PATH_GET_STARTED } from '@/routes/paths';
import { toast } from 'sonner';
import useSidebarStudioCode from '@/hooks/shared/useSidebarStudioCode';
import { SIDEBAR_TOUR_ATTR } from '@/components/shared/tour/tour-steps';

interface ISideBar {
    userRole: UserType;
    props?: React.ComponentProps<typeof Sidebar>;
}

const AppSidebar = (data: ISideBar) => {
    const { userRole, ...props } = data;
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const { logout } = useAuth();
    const { userContext } = useContextType();
    const { minister } = useMinister();
    const { creator } = useCreator();
    const user = userContext.user as {
        onboard?: { status?: string };
    } | null;
    const sidebarStudioCode = useSidebarStudioCode();

    const allGroups = useMemo(
        () => [
            ...navItems.mainNav,
            ...navItems.sermonNav,
            ...navItems.engagementNav,
        ],
        [],
    );

    const visibleGroups = useMemo(() => {
        return allGroups
            .filter((group) => isSidebarGroupVisibleForUser(group, userRole))
            .map((group) => {
                const items = group.items.filter((item) => {
                    if (isHiddenNavItem(item as SidebarNavItemLike)) {
                        return false;
                    }
                    const navItem = item as SidebarNavItemLike;
                    if (
                        navItem.showOnboarding ||
                        navItem.title === 'Get Started'
                    ) {
                        return shouldShowGetStartedNavItem(
                            userRole,
                            minister,
                            user,
                            creator,
                        );
                    }
                    return true;
                });
                return { ...group, items };
            })
            .filter((group) => group.items.length > 0);
    }, [allGroups, userRole, minister, creator, user]);

    return (
        <Sidebar collapsible="icon" className="overflow-hidden" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center mt-2">
                            <img
                                src="/images/assets/troott-icon-dark.svg"
                                alt="Troott icon"
                                className="w-10 h-7"
                            />

                            <div className="group-data-[collapsible=icon]:hidden ">
                                <span className="truncate font-semibold text-2xl">
                                    troott
                                </span>
                            </div>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SearchForm />
            <SidebarContent>
                {visibleGroups.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="uppercase text-muted-foreground/60">
                            {group.title}
                        </SidebarGroupLabel>
                        <Separator
                            orientation="horizontal"
                            className="mb-2 hidden group-data-[collapsible=icon]:block"
                        />
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const href = resolveStudioNavUrl(
                                        item.url,
                                        sidebarStudioCode,
                                    );
                                    const isDisabled =
                                        href === null &&
                                        isStudioScopedLegacyNavUrl(item.url);

                                    const targetHref = href ?? item.url;
                                    const blockForOnboarding =
                                        shouldRedirectStudioNavForOnboarding(
                                            targetHref,
                                            userRole,
                                            minister,
                                            user,
                                            creator,
                                        );
                                    const isDashboardNav =
                                        item.url === '/dashboard';
                                    const isActive =
                                        !isDisabled &&
                                        (isDashboardNav
                                            ? isStudioHomePath(currentPath)
                                            : currentPath === targetHref ||
                                              (targetHref !== '#' &&
                                                  currentPath.startsWith(
                                                      `${targetHref}/`,
                                                  )));

                                    const iconClassName = `
                                text-neutral-400
                                group-data-[active=true]/menu-button:text-white
                              `;
                                    const labelClassName = `
                              text-neutral-50
                              group-data-[active=true]/menu-button:text-white
                            `;
                                    const tourAttr = SIDEBAR_TOUR_ATTR[item.title];

                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            {isDisabled ? (
                                                <SidebarMenuButton
                                                    disabled
                                                    aria-disabled
                                                    data-tour={tourAttr}
                                                    data-active={false}
                                                    className={`
                          group/menu-button
                          flex items-center w-full h-9 gap-3 px-2 rounded-md
                          opacity-50 cursor-not-allowed
                          group-data-[collapsible=icon]:w-9
                          group-data-[collapsible=icon]:justify-center
                          group-data-[collapsible=icon]:px-0
                          group-data-[collapsible=icon]:gap-0
                        `}
                                                    tooltip={`${item.title} (studio unavailable)`}
                                                >
                                                    {item.icon && (
                                                        <item.icon
                                                            size={22}
                                                            aria-hidden="true"
                                                            className={
                                                                iconClassName
                                                            }
                                                        />
                                                    )}
                                                    <span
                                                        className={
                                                            labelClassName
                                                        }
                                                    >
                                                        {item.title}
                                                    </span>
                                                </SidebarMenuButton>
                                            ) : blockForOnboarding ? (
                                                <SidebarMenuButton
                                                    type="button"
                                                    data-tour={tourAttr}
                                                    data-active={false}
                                                    onClick={() => {
                                                        toast.info(
                                                            'Finish Get Started to access your studio.',
                                                        );
                                                        navigate(
                                                            PATH_GET_STARTED,
                                                        );
                                                    }}
                                                    className={`
                          group/menu-button
                          flex items-center w-full h-9 gap-3 px-2 rounded-md
                          hover:bg-muted
                          group-data-[collapsible=icon]:w-9
                          group-data-[collapsible=icon]:justify-center
                          group-data-[collapsible=icon]:px-0
                          group-data-[collapsible=icon]:gap-0
                        `}
                                                    tooltip={item.title}
                                                >
                                                    {item.icon && (
                                                        <item.icon
                                                            size={22}
                                                            aria-hidden="true"
                                                            className={
                                                                iconClassName
                                                            }
                                                        />
                                                    )}
                                                    <span
                                                        className={
                                                            labelClassName
                                                        }
                                                    >
                                                        {item.title}
                                                    </span>
                                                </SidebarMenuButton>
                                            ) : (
                                                <SidebarMenuButton
                                                    asChild
                                                    data-tour={tourAttr}
                                                    data-active={isActive}
                                                    className={`
                          group/menu-button
                          flex items-center w-full h-9 gap-3 px-2 rounded-md
                          hover:bg-muted

                          data-[active=true]:bg-white/10

                          group-data-[collapsible=icon]:w-9
                          group-data-[collapsible=icon]:justify-center
                          group-data-[collapsible=icon]:px-0
                          group-data-[collapsible=icon]:gap-0
                        `}
                                                    tooltip={item.title}
                                                >
                                                    <Link
                                                        to={targetHref}
                                                        className="flex items-center w-full h-full"
                                                    >
                                                        {item.icon && (
                                                            <item.icon
                                                                size={22}
                                                                aria-hidden="true"
                                                                className={
                                                                    iconClassName
                                                                }
                                                            />
                                                        )}
                                                        <span
                                                            className={
                                                                labelClassName
                                                            }
                                                        >
                                                            {item.title}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            )}
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <Separator orientation="horizontal" className="mr-2 h-4" />

            <SidebarFooter>
                <SidebarMenu className="font-medium gap-3 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto">
                    {navFooterItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            {item.title === 'Logout' ? (
                                <SidebarMenuButton
                                    type="button"
                                    onClick={() => void logout()}
                                >
                                    <item.icon />
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            ) : (
                                <SidebarMenuButton asChild>
                                    <a href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </a>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;

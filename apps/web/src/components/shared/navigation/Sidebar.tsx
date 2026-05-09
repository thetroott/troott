import React from 'react';
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
import { Link, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator.tsx';
import type { UserType } from '@troott/api-client';

interface ISideBar {
    userRole: UserType;
    props?: React.ComponentProps<typeof Sidebar>;
}

const AppSidebar = (data: ISideBar) => {
    const { userRole, ...props } = data;
    const location = useLocation();
    const currentPath = location.pathname;

    const items = [
        ...navItems.mainNav,
        ...navItems.sermonNav,
        ...navItems.engagementNav,
    ];

    const visibleItem = items.filter((group) => group.roles.includes(userRole));

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
                {visibleItem.map((group) => (
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
                                    const isActive = currentPath === item.url;

                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                data-active={isActive}
                                                className={`
                          group/menu-button
                          flex items-center w-full h-9 gap-3 px-2 rounded-md
                          hover:bg-muted

                          /* active backgrounds */
                          data-[active=true]:bg-neutral-800
                          dark:data-[active=true]:bg-neutral-50

                          /* collapsed‑icon tweaks */
                          group-data-[collapsible=icon]:w-9
                          group-data-[collapsible=icon]:justify-center
                          group-data-[collapsible=icon]:px-0
                          group-data-[collapsible=icon]:gap-0
                        `}
                                                tooltip={item.title}
                                            >
                                                <Link
                                                    to={item.url}
                                                    className="flex items-center w-full h-full"
                                                >
                                                    {item.icon && (
                                                        <item.icon
                                                            size={22}
                                                            aria-hidden="true"
                                                            className={`
                                /* default icon color */
                                text-neutral-900/70 dark:text-neutral-400


                                /* when active in light: white */
                                group-data-[active=true]/menu-button:text-white

                                /* when active in dark: dark neutral (900) */
                                dark:group-data-[active=true]/menu-button:text-neutral-900
                              `}
                                                        />
                                                    )}
                                                    <span
                                                        className={`
                              /* default text color */
                              text-neutral-900 dark:text-neutral-50

                              /* when active in light: white */
                              group-data-[active=true]/menu-button:text-white

                              /* when active in dark: dark neutral (900) */
                              dark:group-data-[active=true]/menu-button:text-neutral-900
                            `}
                                                    >
                                                        {item.title}
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
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
                            <SidebarMenuButton asChild>
                                <a href={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;

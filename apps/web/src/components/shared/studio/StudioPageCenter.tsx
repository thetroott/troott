import type { ReactNode } from 'react';
import { MY_SERMONS_PAGE } from '@/components/shared/my-sermons/my-sermons-ui';
import { cn } from '@/lib/utils';

type StudioPageCenterProps = {
    children: ReactNode;
    className?: string;
};

/** Full-height studio main column for page-tier empty / loading / error (feat-0026). */
export function StudioPageCenter({ children, className }: StudioPageCenterProps) {
    return (
        <div
            className={cn(
                MY_SERMONS_PAGE.pageBg,
                MY_SERMONS_PAGE.pageRoot,
                className,
            )}
        >
            <div
                className={cn(
                    MY_SERMONS_PAGE.mainColumn,
                    'flex min-h-0 flex-1 flex-col',
                )}
            >
                {children}
            </div>
        </div>
    );
}

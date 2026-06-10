import type { RefObject, ReactNode } from 'react';

type ScrollspyLayoutProps = {
    header: ReactNode;
    nav: ReactNode;
    sectionsRef: RefObject<HTMLDivElement | null>;
    children: ReactNode;
    navLabel?: string;
};

export function ScrollspyLayout({
    header,
    nav,
    sectionsRef,
    children,
    navLabel = 'Document navigation',
}: ScrollspyLayoutProps) {
    return (
        <section className="relative w-full overflow-visible bg-background py-20 sm:py-28">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="mb-12 sm:mb-16">{header}</div>

                <div className="lg:grid lg:grid-cols-[minmax(240px,280px)_1fr] lg:gap-12 xl:gap-16">
                    <div className="relative hidden lg:block">
                        <nav
                            aria-label={navLabel}
                            className="sticky z-10"
                            style={{
                                top: 'calc(var(--site-header-height, 4rem) + 1.5rem)',
                            }}
                        >
                            {nav}
                        </nav>
                    </div>

                    <div
                        ref={sectionsRef}
                        className="flex min-w-0 flex-col gap-16"
                    >
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
}

import Link from 'next/link';

import type { LegalAudience } from '@/_data/legal/types';
import { cx } from '@/lib/utils';

const AUDIENCE_LABELS: Record<LegalAudience, string> = {
    listener: 'Listener',
    minister: 'Minister',
};

type LegalBreadcrumbsProps = {
    audience?: LegalAudience;
    documentTitle?: string;
    className?: string;
};

export function LegalBreadcrumbs({
    audience,
    documentTitle,
    className,
}: LegalBreadcrumbsProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className={cx(
                'font-mono text-[13px] leading-none text-zinc-500',
                className,
            )}
        >
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <li>
                    {audience || documentTitle ? (
                        <Link
                            href="/legal"
                            className="transition-colors hover:text-zinc-300"
                        >
                            // Legal
                        </Link>
                    ) : (
                        <span className="text-zinc-400" aria-current="page">
                            // Legal
                        </span>
                    )}
                </li>

                {audience ? (
                    <>
                        <li aria-hidden="true" className="text-zinc-600">
                            ·
                        </li>
                        <li>
                            {documentTitle ? (
                                <Link
                                    href={`/legal/${audience}`}
                                    className="transition-colors hover:text-zinc-300"
                                >
                                    {AUDIENCE_LABELS[audience]}
                                </Link>
                            ) : (
                                <span
                                    className="text-zinc-400"
                                    aria-current="page"
                                >
                                    {AUDIENCE_LABELS[audience]}
                                </span>
                            )}
                        </li>
                    </>
                ) : null}

                {documentTitle ? (
                    <>
                        <li aria-hidden="true" className="text-zinc-600">
                            ·
                        </li>
                        <li>
                            <span
                                className="text-zinc-400"
                                aria-current="page"
                            >
                                {documentTitle}
                            </span>
                        </li>
                    </>
                ) : null}
            </ol>
        </nav>
    );
}

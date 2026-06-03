import { Link } from 'react-router-dom';
import { MicVocal } from 'lucide-react';
import { studioSermonsListPath } from '@/routes/paths';
import {
    formatSermonPlaysLabel,
    formatSermonRecentDate,
} from '@/app/profile/profile-format.util';
import type { ProfileRecentSermonRow } from '@/hooks/app/useProfileRecentSermons';
import { StudioEmptyState } from '@/components/shared/studio/StudioEmptyState';

const sectionHeading =
    'text-[28px] font-semibold leading-[30px] text-[#eaeaea]';

interface ProfileRecentSermonsProps {
    rows: ProfileRecentSermonRow[];
    isLoading: boolean;
    studioCode: string | undefined;
}

export function ProfileRecentSermons({
    rows,
    isLoading,
    studioCode,
}: ProfileRecentSermonsProps) {
    const seeAllTo =
        studioCode?.trim() ?
            studioSermonsListPath(studioCode)
        :   undefined;

    return (
        <article className="rounded-xl border border-[#545454] bg-[#2b2a2c] p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className={sectionHeading}>Recent Sermons</h3>
                {seeAllTo ? (
                    <Link
                        to={seeAllTo}
                        className="shrink-0 text-sm font-medium text-[#08ffdb] hover:underline"
                    >
                        See all
                    </Link>
                ) : null}
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-14 animate-pulse rounded-lg bg-[#333234]"
                        />
                    ))}
                </div>
            ) : rows.length === 0 ? (
                <StudioEmptyState
                    placement="panel"
                    description="No published sermons yet."
                />
            ) : (
                <ul className="flex flex-col gap-4">
                    {rows.map((row) => (
                        <li key={row.id} className="flex items-start gap-3">
                            <div
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#3a393b]"
                                aria-hidden
                            >
                                <MicVocal className="h-5 w-5 text-[#9d9d9d]" />
                            </div>
                            <div className="min-w-0 flex-1 pt-0.5">
                                <p className="truncate text-base font-medium leading-6 text-[#eaeaea]">
                                    {row.name}
                                </p>
                                <p className="mt-0.5 text-sm leading-5 text-[#9d9d9d]">
                                    {formatSermonRecentDate(row.releaseDateMs)}
                                    {' \u2022 '}
                                    {formatSermonPlaysLabel(row.plays)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </article>
    );
}

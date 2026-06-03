import type { Sermon } from '@/_data/dummySermons';
import BinContextMenu from '@/components/shared/bin/BinContextMenu';
import { canStudioUserPermanentlyDeleteSermon } from '@/utils/sermon-studio-policy.util';
import { cn } from '@/lib/utils';
import {
    MY_SERMONS_GRID,
    MY_SERMONS_LIST,
    SermonListAudioGlyph,
} from '@/components/shared/my-sermons/my-sermons-ui';

function BinGridStatusPill() {
    return (
        <span className="inline-flex h-[22px] max-w-full shrink-0 items-center gap-1.5 rounded-md bg-[#333234] pl-2 pr-2.5 font-matter-medium text-[12px] leading-[18px] text-[#bdbdbd] tracking-[0.02em]">
            <span
                className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#9d9d9d]"
                aria-hidden
            />
            In bin
        </span>
    );
}

interface BinGridViewProps {
    sermons: Sermon[];
    selectedSermons: Set<string>;
    onSermonSelect: (sermonId: string) => void;
    onGetInfo?: (sermonId: string) => void;
    onRestore: (sermonId: string) => void;
    onEmptyImmediately: (sermonId: string) => void;
}

const BinGridView = ({
    sermons,
    selectedSermons,
    onSermonSelect,
    onGetInfo,
    onRestore,
    onEmptyImmediately,
}: BinGridViewProps) => {
    return (
        <div className={MY_SERMONS_GRID.wrap}>
            <div className={MY_SERMONS_GRID.grid}>
                {sermons.map((sermon) => {
                    const selected = selectedSermons.has(sermon.id);
                    return (
                        <article
                            key={sermon.id}
                            className={MY_SERMONS_GRID.card}
                            aria-labelledby={`bin-grid-title-${sermon.id}`}
                        >
                            <div className={MY_SERMONS_GRID.mediaStack}>
                                <div
                                    className={cn(
                                        MY_SERMONS_GRID.mediaHeader,
                                        'justify-between',
                                    )}
                                >
                                    <div className="flex items-start pt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={() =>
                                                onSermonSelect(sermon.id)
                                            }
                                            className={MY_SERMONS_LIST.checkbox}
                                            aria-label={`Select ${sermon.name}`}
                                        />
                                    </div>
                                    <BinGridStatusPill />
                                </div>
                                <div className={MY_SERMONS_GRID.mediaMain}>
                                    <div className={MY_SERMONS_GRID.iconTile}>
                                        <SermonListAudioGlyph />
                                    </div>
                                </div>
                                <div className={MY_SERMONS_GRID.mediaFooter}>
                                    <span
                                        className={MY_SERMONS_GRID.durationChip}
                                    >
                                        {sermon.duration}
                                    </span>
                                </div>
                            </div>

                            <div className={MY_SERMONS_GRID.body}>
                                <div className={MY_SERMONS_GRID.textCol}>
                                    <h3
                                        id={`bin-grid-title-${sermon.id}`}
                                        className={MY_SERMONS_GRID.cardTitle}
                                    >
                                        {sermon.name}
                                    </h3>
                                    <p className={MY_SERMONS_GRID.cardDate}>
                                        {sermon.dateCreated}
                                    </p>
                                </div>
                                <BinContextMenu
                                    sermonId={sermon.id}
                                    triggerClassName={
                                        MY_SERMONS_GRID.gridMenuTrigger
                                    }
                                    onGetInfo={onGetInfo}
                                    onRestore={onRestore}
                                    onEmptyImmediately={onEmptyImmediately}
                                    canPermanentlyDelete={canStudioUserPermanentlyDeleteSermon(
                                        sermon,
                                    )}
                                />
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};

export default BinGridView;

import type { Sermon } from '@/_data/dummySermons';
import SermonContextMenu from './SermonContextMenu';
import { canStudioUserMoveSermonToBin } from '@/utils/sermon-studio-policy.util';
import {
    MY_SERMONS_GRID,
    SermonListAudioGlyph,
    SermonStatusBadge,
} from '@/components/shared/my-sermons/my-sermons-ui';

interface SermonsGridViewProps {
    sermons: Sermon[];
    onGetInfo?: (sermonId: string) => void;
    onEdit: (sermonId: string) => void;
    onRename: (sermonId: string) => void;
    onShare: (sermonId: string) => void;
    onDownload: (sermonId: string) => void;
    onAnalytics: (sermonId: string) => void;
    onMoveToTrash: (sermonId: string) => void;
}

const SermonsGridView = ({
    sermons,
    onGetInfo,
    onEdit,
    onRename,
    onShare,
    onDownload,
    onAnalytics,
    onMoveToTrash,
}: SermonsGridViewProps) => {
    return (
        <div className={MY_SERMONS_GRID.wrap}>
            <div className={MY_SERMONS_GRID.grid}>
                {sermons.map((sermon) => (
                    <article
                        key={sermon.id}
                        className={MY_SERMONS_GRID.card}
                        aria-labelledby={`sermon-grid-title-${sermon.id}`}
                    >
                        <div className={MY_SERMONS_GRID.mediaStack}>
                            <div className={MY_SERMONS_GRID.mediaHeader}>
                                <SermonStatusBadge
                                    status={sermon.publicationStatus}
                                />
                            </div>
                            <div className={MY_SERMONS_GRID.mediaMain}>
                                <div className={MY_SERMONS_GRID.iconTile}>
                                    <SermonListAudioGlyph />
                                </div>
                            </div>
                            <div className={MY_SERMONS_GRID.mediaFooter}>
                                <span className={MY_SERMONS_GRID.durationChip}>
                                    {sermon.duration}
                                </span>
                            </div>
                        </div>

                        <div className={MY_SERMONS_GRID.body}>
                            <div className={MY_SERMONS_GRID.textCol}>
                                <h3
                                    id={`sermon-grid-title-${sermon.id}`}
                                    className={MY_SERMONS_GRID.cardTitle}
                                >
                                    {sermon.name}
                                </h3>
                                <p className={MY_SERMONS_GRID.cardDate}>
                                    {sermon.dateCreated}
                                </p>
                            </div>
                            <SermonContextMenu
                                sermonId={sermon.id}
                                triggerClassName={
                                    MY_SERMONS_GRID.gridMenuTrigger
                                }
                                menuIcon="vertical"
                                onGetInfo={onGetInfo}
                                onEdit={onEdit}
                                onRename={onRename}
                                onShare={onShare}
                                onDownload={onDownload}
                                onAnalytics={onAnalytics}
                                onMoveToTrash={onMoveToTrash}
                                canMoveToTrash={canStudioUserMoveSermonToBin(
                                    sermon,
                                )}
                            />
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default SermonsGridView;

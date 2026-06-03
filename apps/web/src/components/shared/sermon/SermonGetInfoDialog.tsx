import { useMemo } from 'react';
import { Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UPLOAD_SHELL } from '@/components/shared/upload/upload-studio-ui';
import { useSermonByIdQuery } from '@/hooks/app/useSermon';
import {
    isSermonDetailNotFoundError,
    mapSermonDetailToInfoView,
    type SermonGetInfoContext,
    type SermonInfoRow,
} from '@/utils/sermon-info-map.util';

export type SermonGetInfoDialogProps = {
    sermonId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    context: SermonGetInfoContext;
    initialTitle?: string;
};

function InfoRow({ row }: { row: SermonInfoRow }) {
    const copyText = row.copyText;

    const handleCopy = () => {
        if (!copyText) {
            return;
        }
        void navigator.clipboard.writeText(copyText).then(
            () => {
                toast.success(
                    row.label === 'Share link'
                        ? 'Link copied to clipboard.'
                        : 'Copied to clipboard.',
                );
            },
            () => {
                toast.error('Could not copy to clipboard.');
            },
        );
    };

    return (
        <div className="grid grid-cols-[minmax(0,120px)_1fr] gap-x-4 gap-y-1 border-b border-[#545454]/30 py-2.5 last:border-b-0">
            <dt className="font-matter text-xs leading-[18px] text-[#9d9d9d]">
                {row.label}
            </dt>
            <dd className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <span
                        className={cn(
                            'font-matter text-sm leading-5 text-[#eaeaea]',
                            row.multiline && 'max-h-24 overflow-y-auto break-words',
                            row.label === 'Share link' && 'break-all',
                            row.label === 'Sermon ID' && 'font-mono text-xs',
                        )}
                    >
                        {row.value}
                    </span>
                    {copyText ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 shrink-0 px-2 text-[#bdbdbd] hover:text-[#eaeaea]"
                            onClick={handleCopy}
                            aria-label={`Copy ${row.label}`}
                        >
                            <Copy className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                    ) : null}
                </div>
            </dd>
        </div>
    );
}

export function SermonGetInfoDialog({
    sermonId,
    open,
    onOpenChange,
    context,
    initialTitle,
}: SermonGetInfoDialogProps) {
    const enabled = open && Boolean(sermonId);

    const { data, isLoading, isError, error, refetch, isFetching } =
        useSermonByIdQuery(sermonId ?? undefined, {
            enabled,
            staleTime: 0,
            refetchOnMount: 'always',
        });

    const notFound = isError && isSermonDetailNotFoundError(error);
    const retryable = isError && !notFound;

    const viewModel = useMemo(() => {
        if (!data || typeof data !== 'object') {
            return null;
        }
        return mapSermonDetailToInfoView(
            data as Record<string, unknown>,
            context,
            sermonId ?? '',
        );
    }, [context, data, sermonId]);

    const displayTitle =
        viewModel?.title ??
        (isLoading || isFetching ? initialTitle : undefined) ??
        initialTitle ??
        'Sermon';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    'flex max-h-[min(85vh,640px)] flex-col gap-0 overflow-hidden border-[#545454]/50 bg-[#2b2a2c] p-0 text-[#eaeaea] shadow-xl sm:max-w-lg',
                    '[&_[data-slot=dialog-close]]:text-[#eaeaea] [&_[data-slot=dialog-close]]:hover:bg-white/10',
                )}
                aria-describedby={undefined}
            >
                <DialogHeader className="shrink-0 space-y-0 border-b border-[#545454]/50 px-6 py-4 text-left">
                    <DialogTitle className={cn(UPLOAD_SHELL.titleText, 'text-left')}>
                        Sermon info
                    </DialogTitle>
                </DialogHeader>

                <div
                    className="min-h-0 flex-1 overflow-y-auto px-6 py-4"
                    aria-busy={isLoading || isFetching}
                >
                    {isLoading || (isFetching && !viewModel && !isError) ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-12">
                            <Loader2
                                className="h-8 w-8 animate-spin text-[#bdbdbd]"
                                aria-hidden
                            />
                            <p className="font-matter text-sm text-[#9d9d9d]">
                                Loading sermon…
                            </p>
                            {initialTitle ? (
                                <p className="max-w-full truncate font-matter-medium text-sm text-[#eaeaea]">
                                    {initialTitle}
                                </p>
                            ) : null}
                        </div>
                    ) : notFound ? (
                        <p className="font-matter text-sm leading-5 text-[#9d9d9d]">
                            This sermon could not be found. It may have been
                            removed.
                        </p>
                    ) : retryable ? (
                        <div className="space-y-4 py-4">
                            <p className="font-matter text-sm leading-5 text-[#9d9d9d]">
                                Could not load sermon details. Check your
                                connection and try again.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-[#707070] text-[#eaeaea] hover:bg-white/5"
                                onClick={() => void refetch()}
                            >
                                Retry
                            </Button>
                        </div>
                    ) : isError ? (
                        <div className="space-y-4 py-4">
                            <p className="font-matter text-sm leading-5 text-[#9d9d9d]">
                                Could not load sermon details.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-[#707070] text-[#eaeaea] hover:bg-white/5"
                                onClick={() => void refetch()}
                            >
                                Retry
                            </Button>
                        </div>
                    ) : viewModel ? (
                        <div>
                            <h2 className="mb-4 font-matter-medium text-base leading-6 tracking-[0.16px] text-[#eaeaea]">
                                {displayTitle}
                            </h2>
                            {viewModel.binLocationHint ? (
                                <p className="mb-3 font-matter text-xs leading-[18px] text-[#9d9d9d]">
                                    {viewModel.binLocationHint}
                                </p>
                            ) : null}
                            <dl>{viewModel.rows.map((row) => (
                                <InfoRow key={row.label} row={row} />
                            ))}</dl>
                        </div>
                    ) : null}
                </div>

                <div className="flex shrink-0 justify-end border-t border-[#545454]/50 px-6 py-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-[#707070] font-matter-medium text-[#eaeaea] hover:bg-white/5"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

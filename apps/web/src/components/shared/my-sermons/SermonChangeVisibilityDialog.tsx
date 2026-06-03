import { useCallback, useEffect, useState } from 'react';
import { Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { StudioConfirmDialog } from '@/components/shared/studio/StudioConfirmDialog';
import { UPLOAD_SHELL } from '@/components/shared/upload/upload-studio-ui';
import { isApiHttp2xxErrorEnvelope } from '@/api/core/api-envelope-toast';
import { useUpdateSermonMutation } from '@/hooks/app/useSermon';
import { cn } from '@/lib/utils';
import {
    type SermonVisibilityValue,
    visibilityLabel,
    visibilityToIsPublic,
} from '@/utils/sermon-visibility.util';

const VISIBILITY_OPTIONS: {
    value: SermonVisibilityValue;
    label: string;
    description: string;
}[] = [
    {
        value: 'public',
        label: 'Public',
        description: 'Anyone can find and listen',
    },
    {
        value: 'unlisted',
        label: 'Unlisted',
        description: 'Only people with the link can listen',
    },
    {
        value: 'private',
        label: 'Private',
        description: 'Only you can listen',
    },
];

const studioSelectTriggerClass = cn(
    '!w-full min-w-0 h-10 border-[#707070] bg-[#242325] font-matter text-sm text-[#eaeaea] shadow-none',
    'focus-visible:ring-[#08ffdb]/40 [&_svg]:text-[#bdbdbd]',
);

export type SermonChangeVisibilityDialogProps = {
    sermonId: string | null;
    sermonTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialVisibility: SermonVisibilityValue;
    shareableUrl?: string;
    onSuccess?: () => void;
};

export function SermonChangeVisibilityDialog({
    sermonId,
    sermonTitle,
    open,
    onOpenChange,
    initialVisibility,
    shareableUrl,
    onSuccess,
}: SermonChangeVisibilityDialogProps) {
    const updateMutation = useUpdateSermonMutation();
    const [visibility, setVisibility] =
        useState<SermonVisibilityValue>(initialVisibility);
    const [confirmDowngradeOpen, setConfirmDowngradeOpen] = useState(false);
    const [pendingVisibility, setPendingVisibility] =
        useState<SermonVisibilityValue | null>(null);

    useEffect(() => {
        if (open) {
            setVisibility(initialVisibility);
            setPendingVisibility(null);
            setConfirmDowngradeOpen(false);
        }
    }, [open, initialVisibility]);

    const persistVisibility = useCallback(
        async (next: SermonVisibilityValue) => {
            if (!sermonId) {
                return;
            }
            try {
                const res = await updateMutation.mutateAsync({
                    id: sermonId,
                    payload: {
                        visibility: next,
                        isPublic: visibilityToIsPublic(next),
                    },
                });
                if (res.error) {
                    if (!isApiHttp2xxErrorEnvelope(res)) {
                        toast.error(
                            res.message || 'Could not update visibility.',
                        );
                    }
                    return;
                }
                toast.success('Visibility updated.');
                onOpenChange(false);
                onSuccess?.();
            } catch (e: unknown) {
                toast.error(
                    e && typeof e === 'object' && 'message' in e
                        ? String((e as { message: unknown }).message)
                        : 'Could not update visibility.',
                );
            }
        },
        [onOpenChange, onSuccess, sermonId, updateMutation],
    );

    const handleSave = useCallback(() => {
        if (!sermonId || visibility === initialVisibility) {
            onOpenChange(false);
            return;
        }
        if (
            initialVisibility === 'public' &&
            (visibility === 'private' || visibility === 'unlisted')
        ) {
            setPendingVisibility(visibility);
            setConfirmDowngradeOpen(true);
            return;
        }
        void persistVisibility(visibility);
    }, [
        initialVisibility,
        onOpenChange,
        persistVisibility,
        sermonId,
        visibility,
    ]);

    const shareLink =
        shareableUrl?.trim() ||
        (sermonId ? `${window.location.origin}/sermon/${sermonId}` : '');

    const showShareLink =
        shareLink &&
        (visibility === 'public' ||
            visibility === 'unlisted' ||
            initialVisibility === 'public' ||
            initialVisibility === 'unlisted');

    const selectedHelper =
        VISIBILITY_OPTIONS.find((o) => o.value === visibility)?.description ??
        '';

    const saving = updateMutation.isPending;

    return (
        <>
            <StudioConfirmDialog
                open={confirmDowngradeOpen}
                onOpenChange={setConfirmDowngradeOpen}
                title="Change visibility?"
                description={
                    <>
                        <p>
                            You&apos;re changing{' '}
                            <span className="font-matter-medium text-[#eaeaea]">
                                {sermonTitle}
                            </span>{' '}
                            from public. It may disappear from search and
                            discovery.
                        </p>
                        <p>
                            Existing links and search results may take time to
                            update.
                        </p>
                    </>
                }
                confirmLabel="Change visibility"
                confirmTone="destructive"
                onConfirm={() => {
                    if (pendingVisibility) {
                        void persistVisibility(pendingVisibility);
                    }
                    setConfirmDowngradeOpen(false);
                }}
            />

            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className={cn(
                        'w-[min(100%-2rem,28rem)] max-w-[min(100%-2rem,28rem)] sm:max-w-[28rem]',
                        'border-[#545454]/50 bg-[#2b2a2c] p-6 text-[#eaeaea] shadow-xl',
                        '[&_[data-slot=dialog-close]]:text-[#eaeaea] [&_[data-slot=dialog-close]]:hover:bg-white/10',
                    )}
                >
                    <DialogHeader className="gap-3 text-left sm:text-left">
                        <DialogTitle
                            className={cn(UPLOAD_SHELL.titleText, 'text-left')}
                        >
                            Change visibility
                        </DialogTitle>
                        <DialogDescription asChild>
                            <p
                                className={cn(
                                    UPLOAD_SHELL.mutedLabel,
                                    'text-left text-[14px] leading-5',
                                )}
                            >
                                Choose who can find and listen to this sermon.
                            </p>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="min-w-0 space-y-4 pt-2">
                        <div className="min-w-0 space-y-2">
                            <label
                                htmlFor="sermon-visibility-select"
                                className={UPLOAD_SHELL.mediumLabel}
                            >
                                Visibility
                            </label>
                            <Select
                                value={visibility}
                                onValueChange={(v) =>
                                    setVisibility(v as SermonVisibilityValue)
                                }
                            >
                                <SelectTrigger
                                    id="sermon-visibility-select"
                                    className={studioSelectTriggerClass}
                                    aria-label="Visibility"
                                >
                                    <SelectValue>
                                        {visibilityLabel(visibility)}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent
                                    position="item-aligned"
                                    className="z-[60] min-w-[var(--radix-select-trigger-width)] border-[#545454]/50 bg-[#333234] text-[#eaeaea]"
                                >
                                    {VISIBILITY_OPTIONS.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                            className="py-2 focus:bg-white/10 focus:text-[#eaeaea]"
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedHelper ? (
                                <p className="font-matter text-xs leading-[18px] text-[#9d9d9d]">
                                    {selectedHelper}
                                </p>
                            ) : null}
                        </div>

                        {showShareLink ? (
                            <div className="min-w-0 space-y-2">
                                <p className={UPLOAD_SHELL.mediumLabel}>
                                    Shareable link
                                </p>
                                <div
                                    className={cn(
                                        UPLOAD_SHELL.footerLinkField,
                                        'min-w-0',
                                    )}
                                >
                                    <p className="min-w-0 flex-1 truncate font-mono text-xs text-[#eaeaea]">
                                        {shareLink}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 shrink-0 px-2 text-[#bdbdbd] hover:text-[#eaeaea]"
                                        aria-label="Copy shareable link"
                                        onClick={() => {
                                            void navigator.clipboard
                                                .writeText(shareLink)
                                                .then(
                                                    () => {
                                                        toast.success(
                                                            'Link copied to clipboard.',
                                                        );
                                                    },
                                                    () => {
                                                        toast.error(
                                                            'Could not copy link.',
                                                        );
                                                    },
                                                );
                                        }}
                                    >
                                        <Copy
                                            className="h-3.5 w-3.5"
                                            aria-hidden
                                        />
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={saving}
                            className="border-[#707070] font-matter-medium text-[#eaeaea] hover:bg-white/5"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={saving}
                            className={UPLOAD_SHELL.primaryCta}
                            onClick={() => void handleSave()}
                        >
                            {saving ? (
                                <>
                                    <Loader2
                                        className="mr-2 h-4 w-4 animate-spin"
                                        aria-hidden
                                    />
                                    Save
                                </>
                            ) : (
                                'Save'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

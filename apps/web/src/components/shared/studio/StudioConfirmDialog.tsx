import type { ReactNode } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UPLOAD_SHELL } from '@/components/shared/upload/upload-studio-ui';
import { Loader2 } from 'lucide-react';

export type StudioConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: ReactNode;
    confirmLabel: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    confirmTone?: 'primary' | 'destructive';
    confirming?: boolean;
};

/**
 * Studio-styled confirmation dialog (dark shell, left-aligned copy).
 * Matches upload wizard confirms in `UploadProgressStep` / `DocumentVerificationModal`.
 */
export function StudioConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    cancelLabel = 'Cancel',
    onConfirm,
    confirmTone = 'primary',
    confirming = false,
}: StudioConfirmDialogProps) {
    const handleOpenChange = (next: boolean) => {
        if (confirming && !next) {
            return;
        }
        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className={cn(
                    'sm:max-w-md border-[#545454]/50 bg-[#2b2a2c] p-6 text-[#eaeaea] shadow-xl',
                    '[&_[data-slot=dialog-close]]:text-[#eaeaea] [&_[data-slot=dialog-close]]:hover:bg-white/10',
                )}
            >
                <DialogHeader className="gap-3 text-left sm:text-left">
                    <DialogTitle
                        className={cn(UPLOAD_SHELL.titleText, 'text-left')}
                    >
                        {title}
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div
                            className={cn(
                                UPLOAD_SHELL.mutedLabel,
                                'space-y-3 text-left text-[14px] leading-5',
                            )}
                        >
                            {description}
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={confirming}
                        className="border-[#707070] font-matter-medium text-[#eaeaea] hover:bg-white/5"
                        onClick={() => onOpenChange(false)}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        disabled={confirming}
                        variant={
                            confirmTone === 'destructive'
                                ? 'destructive'
                                : undefined
                        }
                        className={
                            confirmTone === 'primary'
                                ? UPLOAD_SHELL.primaryCta
                                : 'font-matter-medium'
                        }
                        onClick={() => void onConfirm()}
                    >
                        {confirming ? (
                            <>
                                <Loader2
                                    className="mr-2 h-4 w-4 animate-spin"
                                    aria-hidden
                                />
                                {confirmLabel}
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

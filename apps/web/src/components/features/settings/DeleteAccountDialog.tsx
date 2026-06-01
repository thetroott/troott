import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type DeleteAccountDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void | Promise<void>;
    submitting: boolean;
};

export function DeleteAccountDialog({
    open,
    onOpenChange,
    onConfirm,
    submitting,
}: DeleteAccountDialogProps) {
    const handleOpenChange = (next: boolean) => {
        if (submitting && !next) {
            return;
        }
        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className={cn(
                    'border-[#545454]/50 bg-[#2b2a2c] p-6 text-[#eaeaea] shadow-xl sm:max-w-md',
                    '[&_[data-slot=dialog-close]]:text-[#eaeaea] [&_[data-slot=dialog-close]]:hover:bg-white/10',
                )}
            >
                <DialogHeader className="gap-3 text-left sm:text-left">
                    <DialogTitle className="text-left text-[#eaeaea]">
                        Delete account?
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="space-y-3 text-left text-sm leading-5 text-[#bdbdbd]">
                            <p>
                                You are about to permanently delete your account
                                and all associated data.
                            </p>
                            <p>
                                This action cannot be undone. You will be signed
                                out immediately.
                            </p>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={submitting}
                        className="border-[#707070] font-medium text-[#eaeaea] hover:bg-white/5"
                        onClick={() => handleOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={submitting}
                        onClick={() => void onConfirm()}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete account'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

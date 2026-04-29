import { useState } from 'react';
import { Button } from '@/components/ui/button';
import UploadEntryStepModal from '@/components/shared/upload/UploadEntryStepModal';

const Preview = () => {
    const [open, setOpen] = useState(true);
    const [lastPick, setLastPick] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-[#171717] flex flex-col items-center justify-center p-6 gap-6">
            <p className="text-sm text-muted-foreground text-center max-w-md">
                Dev preview: Upload entry modal (returning-user step 1). Use the
                controls below to toggle it.
            </p>
            <Button type="button" onClick={() => setOpen(true)}>
                Open upload modal
            </Button>
            {lastPick ? (
                <p className="text-xs text-foreground/80 font-mono max-w-lg text-center break-all">
                    Last selection: {lastPick}
                </p>
            ) : null}
            <UploadEntryStepModal
                open={open}
                onOpenChange={setOpen}
                onFileSelected={(file) => {
                    setLastPick(
                        `${file.name} (${Math.round(file.size / 1024)} KB)`,
                    );
                    setOpen(false);
                }}
            />
        </div>
    );
};

export default Preview;

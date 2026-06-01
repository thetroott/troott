import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import useContextType from '@/hooks/shared/useContextType';
import { useMinister } from '@/context/minister/useMinister';
import { useCreator } from '@/context/creator/useCreator';
import {
    flushDraftForPath,
    GET_STARTED_SAVE_EXIT_NO_DRAFT_TOAST,
    GET_STARTED_SAVE_EXIT_SUCCESS_TOAST,
    hasDraftSupport,
    resolveGetStartedExitPath,
} from '@/services/get-started-save-exit';
import { useGetStartedCheckpointBusy } from './GetStartedProgressContext';

function SaveAndExit() {
    const navigate = useNavigate();
    const location = useLocation();
    const { busy } = useGetStartedCheckpointBusy();
    const [saving, setSaving] = useState(false);
    const { userContext } = useContextType();
    const { minister } = useMinister();
    const { creator } = useCreator();

    const handleSaveAndExit = async () => {
        if (busy || saving) return;

        setSaving(true);
        try {
            const path = location.pathname;
            const draftSupported = hasDraftSupport(path);

            if (draftSupported) {
                const { saved, storageOk } = flushDraftForPath(path);
                if (!storageOk) {
                    toast.error(
                        'Could not save progress. Check browser storage settings and try again.',
                    );
                    return;
                }
                if (!saved) {
                    toast.message(GET_STARTED_SAVE_EXIT_NO_DRAFT_TOAST);
                } else {
                    toast.success(GET_STARTED_SAVE_EXIT_SUCCESS_TOAST);
                }
            } else {
                toast.message(GET_STARTED_SAVE_EXIT_NO_DRAFT_TOAST);
            }

            const target = resolveGetStartedExitPath(
                userContext.userType,
                minister,
                userContext.user as { onboard?: { status?: string } } | null,
                creator,
            );
            navigate(target);
        } finally {
            setSaving(false);
        }
    };

    const disabled = busy || saving;

    return (
        <Button
            variant="ghost"
            onClick={() => void handleSaveAndExit()}
            disabled={disabled}
            aria-label="Save and exit"
            className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
        >
            <Save size={16} />
            <span>{saving ? 'Saving…' : 'Save & Exit'}</span>
        </Button>
    );
}

export default SaveAndExit;

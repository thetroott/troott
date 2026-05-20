import { useEffect } from 'react';
import { toast } from 'sonner';
import { InfoIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LAST_DISMISSED_VERSION = 'lastDismissedVersion';
const TOAST_ID = 'version-check-notification';

export default function useVersionCheck(intervalMs = 5 * 60 * 1000) {
    const currentVersion = import.meta.env.VITE_APP_VERSION ?? '0.0.0';

    useEffect(() => {
        if (!import.meta.env.PROD) {
            console.log('[VersionCheck] Skipped outside production build');
            return;
        }

        const refreshIfNewBuild = async () => {
            try {
                const res = await fetch(`/meta.json?t=${Date.now()}`, {
                    cache: 'no-cache',
                });
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const meta = (await res.json()) as { versionId?: string };
                const latestVersion = meta.versionId;
                if (!latestVersion) return;

                const dismissedVersion = localStorage.getItem(
                    LAST_DISMISSED_VERSION,
                );
                const timestamp = new Date().toISOString();

                if (latestVersion !== currentVersion) {
                    if (dismissedVersion === latestVersion) {
                        console.info(
                            `[VersionCheck][${timestamp}] Dismissed version: ${latestVersion}`,
                        );
                        return;
                    }

                    console.info(
                        `[VersionCheck][${timestamp}] New version detected. Current: ${currentVersion}, Latest: ${latestVersion}`,
                    );

                    toast.custom(
                        (id) => (
                            <div className="border-border bg-background w-80 rounded-md border p-4 shadow-md">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                                            <InfoIcon className="text-primary h-4 w-4" />
                                        </div>
                                        <h3 className="text-lg text-foreground">
                                            New version available
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toast.dismiss(id)}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label="Dismiss"
                                    >
                                        <XIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                <p className="text-muted-foreground mb-4 text-sm">
                                    A new software version is available.
                                    Reload to use the latest fixes and features.
                                </p>

                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        onClick={() => {
                                            localStorage.setItem(
                                                LAST_DISMISSED_VERSION,
                                                latestVersion,
                                            );
                                            toast.dismiss(id);
                                        }}
                                    >
                                        Not now
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        type="button"
                                        onClick={() => {
                                            toast.dismiss(id);
                                            window.location.reload();
                                        }}
                                    >
                                        Update
                                    </Button>
                                </div>
                            </div>
                        ),
                        {
                            duration: Number.POSITIVE_INFINITY,
                            id: TOAST_ID,
                        },
                    );
                } else {
                    console.debug(
                        `[VersionCheck][${timestamp}] Up to date: ${currentVersion}`,
                    );
                }
            } catch (err) {
                console.error('Error checking version', err);
            }
        };

        void refreshIfNewBuild();
        const intervalId = window.setInterval(
            () => void refreshIfNewBuild(),
            intervalMs,
        );
        return () => window.clearInterval(intervalId);
    }, [intervalMs, currentVersion]);
}

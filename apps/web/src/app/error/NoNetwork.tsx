import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PATH_LOGIN, PATH_NO_NETWORK } from '@/routes/paths';

type NoNetworkLocationState = {
    from?: string;
};

const NoNetwork = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = (location.state ?? {}) as NoNetworkLocationState;

    let returnPath = state.from ?? PATH_LOGIN;
    if (!state.from) {
        const stored = sessionStorage.getItem('troott_no_network_return');
        sessionStorage.removeItem('troott_no_network_return');
        if (stored && stored !== PATH_NO_NETWORK) {
            returnPath = stored;
        }
    }

    const handleRetry = () => {
        navigate(returnPath, { replace: true });
        window.location.reload();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center"
            role="alert"
            aria-live="assertive"
        >
            <div className="flex max-w-md flex-col items-center gap-6">
                <div
                    className="flex size-14 items-center justify-center rounded-full bg-[#1a1a1a] text-[#9d9d9d]"
                    aria-hidden
                >
                    <WifiOff className="size-6" strokeWidth={1.75} />
                </div>
                <div className="space-y-2">
                    <h1 className="font-matter-medium text-lg leading-6 text-[#eaeaea]">
                        Unable to connect to the server. Please check your
                        internet connection.
                    </h1>
                    <p className="font-matter text-sm leading-5 text-[#9d9d9d]">
                        Check your connection, then try again.
                    </p>
                </div>
                <Button type="button" onClick={handleRetry}>
                    <RefreshCw className="size-4" aria-hidden />
                    Try again
                </Button>
            </div>
        </div>
    );
};

export default NoNetwork;

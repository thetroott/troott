import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PATH_NO_NETWORK } from '@/routes/paths';

const useNetwork = (trigger: boolean = true) => {
    const navigate = useNavigate();
    const location = useLocation();

    const popNetwork = useCallback(() => {
        if (location.pathname === PATH_NO_NETWORK) {
            return;
        }
        navigate(PATH_NO_NETWORK, {
            replace: true,
            state: {
                from: `${location.pathname}${location.search}`,
            },
        });
    }, [location.pathname, location.search, navigate]);

    useEffect(() => {
        if (!trigger) {
            return;
        }

        const onOffline = () => {
            popNetwork();
        };

        window.addEventListener('offline', onOffline, false);
        return () => {
            window.removeEventListener('offline', onOffline);
        };
    }, [trigger, popNetwork]);

    return { popNetwork };
};

export default useNetwork;

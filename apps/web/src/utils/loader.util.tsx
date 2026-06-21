import { PATH_NO_NETWORK } from '@/routes/paths';

const MainLoader = () => {
    return (
        <div>
            <div className="suspense bg-brand">
                <div className="suspense_image ui-text-center">
                    <span className="loader white md"></span>
                </div>
            </div>
        </div>
    );
};

const popNetwork = () => {
    if (window.location.pathname === PATH_NO_NETWORK) {
        return;
    }
    sessionStorage.setItem(
        'troott_no_network_return',
        `${window.location.pathname}${window.location.search}`,
    );
    window.location.assign(PATH_NO_NETWORK);
};

const pop = { MainLoader, popNetwork };

export default pop;

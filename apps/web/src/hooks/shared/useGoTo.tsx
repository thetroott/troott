import { useLocation, useNavigate } from 'react-router-dom';

const useGoTo = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const goTo = (url: string) => {
        if (url) {
            navigate(url);
        }
    };

    const toMainRoute = () => {
        navigate('/');
    };

    return {
        location,
        navigate,
        goTo,
        toMainRoute,
    };
};

export default useGoTo;

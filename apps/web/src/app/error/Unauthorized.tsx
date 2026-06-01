import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PATH_LOGIN } from '@/routes/paths';
import { UNAUTHORIZED_REASON_LISTENER } from '@/utils/auth-redirect.util';
import useAuth from '@/hooks/app/useAuth';

type UnauthorizedLocationState = {
    reason?: string;
    message?: string;
};

const Unauthorized = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const state = (location.state ?? {}) as UnauthorizedLocationState;

    const isListenerPortal =
        state.reason === UNAUTHORIZED_REASON_LISTENER;

    const title = isListenerPortal
        ? 'Use the Troott mobile app'
        : 'You do not have access to this area';

    const description = isListenerPortal
        ? 'Listener accounts are not supported on the web portal. Sign in on the Troott mobile app to listen, save sermons, and manage your library.'
        : state.message ||
          'Your account is signed in, but this part of the website is only available to ministers, creators, and platform admins.';

    const handleSignOut = async () => {
        await logout();
    };

    return (
        <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-6 px-6 text-center">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {title}
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {description}
                </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
                <Button type="button" variant="outline" onClick={handleSignOut}>
                    Sign out
                </Button>
                {!isListenerPortal && (
                    <Button type="button" asChild>
                        <Link to={PATH_LOGIN}>Back to sign in</Link>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Unauthorized;

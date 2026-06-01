import { BrowserRouter as Router } from 'react-router-dom';
import Routes from '@/routes/routes';
import { AuthSessionRouting } from '@/context/session/AuthSessionRouting';
import { AppProvider } from '@/context/apps/app.context';
import AppState from '@/context/app/appState';
import { Toaster } from '@/components/ui/sonner';
import ReactQueryProvider from '@/services/tanstack/ReactQueryProvider';
import useVersionCheck from './hooks/shared/useVersionCheck';

const App = () => {

    useVersionCheck();

    return (
        <AppState>
            <Toaster richColors  position="top-right" />
            <ReactQueryProvider>
                <AppProvider>
                    <Router>
                        <AuthSessionRouting />
                        <div className="flex min-h-dvh min-w-0 flex-1 flex-col bg-background">
                            <Routes />
                        </div>
                    </Router>
                </AppProvider>
            </ReactQueryProvider>
        </AppState>
    );
};

export default App;

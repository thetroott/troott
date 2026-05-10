import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from '@/routes/AppRoutes';
import { AppProvider } from '@/context/apps/app.context';
import useVersionCheck from './hooks/shared/useVersionCheck';

const App = () => {

    useVersionCheck();

    return (
        <AppProvider>
            <Router>
                <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
                    <AppRoutes />
                </div>
            </Router>
        </AppProvider>
    );
};

export default App;

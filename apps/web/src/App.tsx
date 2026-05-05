import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from '@/routes/AppRoutes';
import { AppProvider } from '@/context/app/app.context';

const App = () => {
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

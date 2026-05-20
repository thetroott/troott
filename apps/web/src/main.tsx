import ReactDOM from 'react-dom/client';
import './index.css';
import '@/api/config';
import App from './App.tsx';
import PosthogWrapper from './services/posthog/PosthogProvider.tsx';
import SentryProvider from './services/sentry/SentryProvider.tsx';
import VercelSpeedInsights from './services/vercel/vercel.tsx';

const isProd = import.meta.env.VITE_APP_ENVIRONMENT === 'prod';

ReactDOM.createRoot(document.getElementById('root')!).render(
    isProd ? (
        <SentryProvider>
            <PosthogWrapper>
                <App />
                <VercelSpeedInsights />
            </PosthogWrapper>
        </SentryProvider>
    ) : (
        <App />
    ),
);

import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { NODE_ENV, NodeEnv } from './utils/types.util.tsx';
import SentryProvider from './services/sentry/SentryProvider.tsx';
import PosthogWrapper from './services/posthog/PosthogProvider.tsx';


const isProd = NODE_ENV === NodeEnv.PROD;

ReactDOM.createRoot(document.getElementById('root')!).render(
    <div>
    {isProd ? (
        <SentryProvider>
            <PosthogWrapper>
                <App />
            
            </PosthogWrapper>
        </SentryProvider>
    ) : (
        <App />
    )}
</div>,
    // <StrictMode>
    //     <QueryProvider>
    //         <TroottStateProvider>
    //             <App />
    //             <Toaster richColors position="top-right" />
    //         </TroottStateProvider>
    //     </QueryProvider>
    // </StrictMode>,
);

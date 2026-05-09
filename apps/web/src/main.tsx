import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import '@/api/clients/troott';
import App from './App.tsx';
import { QueryProvider } from '@/services/shared/cache-query.tsx';
import { Toaster } from '@/components/ui/sonner';
import { initTheme } from '@/store/theme.store';
import { TroottStateProvider } from '@troott/state';

/** One-shot cleanup of removed auth keys (canonical UserType migration). */
function migrateStaleAuthKeys(): void {
    try {
        localStorage.removeItem('businessType');
        document.cookie =
            'businessType=; Max-Age=0; Path=/; SameSite=Lax';
    } catch {
        /* ignore */
    }
}

migrateStaleAuthKeys();

initTheme();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryProvider>
            <TroottStateProvider>
                <App />
                <Toaster richColors position="top-right" />
            </TroottStateProvider>
        </QueryProvider>
    </StrictMode>,
);

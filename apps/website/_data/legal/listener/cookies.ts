import type { LegalDocument } from '../types';

const LAST_UPDATED = 'March 2026';

export const listenerCookies: LegalDocument = {
    audience: 'listener',
    slug: 'cookies',
    label: '// Legal · // Listener · Cookies',
    heading: 'Cookie policy',
    headingMuted: `how we use cookies · Last updated ${LAST_UPDATED}`,
    lastUpdated: '2026-03-01',
    sourceRefs: [
        'apps/mobile/api/services/secure-storage.tsx',
        'apps/website/app/layout.tsx',
    ],
    sections: [
        {
            id: 'overview',
            navLabel: 'Overview',
            eyebrow: '1',
            title: 'Overview',
            body: `<p>This policy describes cookies and similar technologies used in connection with Troott listener services, including the mobile app and troott.com pages you may open from the app.</p>`,
        },
        {
            id: 'mobile-storage',
            navLabel: 'App storage',
            eyebrow: '2',
            title: 'Mobile app storage',
            body: `<p>The Troott mobile app does not use browser cookies. Instead, it stores session tokens in your device's secure storage (iOS Keychain / Android Keystore) and may cache non-sensitive preferences locally (for example via MMKV). These technologies are necessary to keep you signed in and to improve performance.</p>
<p>Authentication tokens are not stored in analytics or crash logs.</p>`,
        },
        {
            id: 'website',
            navLabel: 'Website',
            eyebrow: '3',
            title: 'troott.com website',
            body: `<p>If you visit troott.com (for example from an in-app browser or marketing link), we may use:</p>
<ul>
<li><strong>Vercel Analytics</strong> — anonymous usage metrics on marketing pages.</li>
<li><strong>MailerLite</strong> — if you subscribe to our newsletter and consent to marketing emails.</li>
</ul>
<p>These apply to the website, not the native mobile app session.</p>`,
        },
        {
            id: 'managing',
            navLabel: 'Managing',
            eyebrow: '4',
            title: 'Managing preferences',
            body: `<p>On mobile, you can sign out to clear app session data, adjust notification permissions in device settings, and uninstall the app to remove local storage.</p>
<p>On the web, you can clear browser cookies or use private browsing. Newsletter subscribers can unsubscribe via MailerLite links in each email.</p>
<p>Questions: <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>`,
        },
    ],
};

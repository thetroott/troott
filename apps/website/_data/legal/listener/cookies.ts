import type { LegalDocument } from '../types';

const LAST_UPDATED = 'June 2026';

export const listenerCookies: LegalDocument = {
    audience: 'listener',
    slug: 'cookies',
    label: '// Legal · // Listener · Cookies',
    heading: 'Cookie policy',
    headingMuted: `cookies and storage · Last updated ${LAST_UPDATED}`,
    lastUpdated: '2026-06-02',
    sourceRefs: [
        'apps/mobile/api/services/secure-storage.tsx',
        'apps/mobile/api/services/mmkv-storage.tsx',
        'apps/website/app/layout.tsx',
        'specs/website/feature/feat-0017/LEGAL_CONTENT_MATRIX.md',
    ],
    sections: [
        {
            id: 'overview',
            navLabel: 'Overview',
            eyebrow: '1',
            title: 'Overview',
            body: `<p>This policy describes cookies and similar technologies used in connection with Troott listener services, including the native mobile app and troott.com pages you may open from the app or marketing links.</p>
<p>The Troott mobile app does not use browser cookies. Web pages may. This document covers both.</p>`,
        },
        {
            id: 'mobile-storage',
            navLabel: 'App storage',
            eyebrow: '2',
            title: 'Mobile app storage',
            body: `<p>The Troott listener app stores data on your device using:</p>
<ul>
<li><strong>Secure storage (Keychain / Keystore)</strong> — authentication tokens (JWT) required to keep you signed in. Tokens are not stored in analytics or crash logs.</li>
<li><strong>MMKV local cache</strong> — non-sensitive preferences and cached app data to improve performance and offline behaviour.</li>
</ul>
<p>These technologies are necessary for the app to function and are not browser cookies.</p>`,
        },
        {
            id: 'website-cookies',
            navLabel: 'Website',
            eyebrow: '3',
            title: 'troott.com website cookies',
            body: `<p>If you visit troott.com (for example from an in-app browser or marketing link), we or our partners may use:</p>
<ul>
<li><strong>Vercel Analytics</strong> — anonymous page-view metrics on marketing pages.</li>
<li><strong>MailerLite</strong> — if you subscribe to our newsletter and consent to marketing emails.</li>
</ul>
<p>These apply to the website visit, not your native mobile app session.</p>`,
        },
        {
            id: 'purposes',
            navLabel: 'Purposes',
            eyebrow: '4',
            title: 'Purposes',
            body: `<p>We use cookies and similar technologies to:</p>
<ul>
<li>Authenticate you and maintain your session (app secure storage; Studio cookies if you visit app.troott.com).</li>
<li>Remember preferences and improve performance.</li>
<li>Measure marketing site usage and newsletter engagement.</li>
<li>Protect against abuse and ensure service reliability.</li>
</ul>`,
        },
        {
            id: 'third-parties',
            navLabel: 'Third parties',
            eyebrow: '5',
            title: 'Third-party technologies',
            body: `<p>Third parties that may set cookies or use similar technologies when you interact with Troott services include:</p>
<ul>
<li><strong>Vercel</strong> — website analytics.</li>
<li><strong>MailerLite</strong> — newsletter subscription and email delivery.</li>
<li><strong>Google / Apple</strong> — OAuth sign-in flows opened in a browser or system sheet.</li>
</ul>
<p>Third-party policies govern their own cookies. See our <a href="/legal/listener/privacy-policy">Privacy Policy</a> for how we share personal data with processors.</p>`,
        },
        {
            id: 'duration',
            navLabel: 'Duration',
            eyebrow: '6',
            title: 'How long they last',
            body: `<p><strong>App session tokens</strong> — until you sign out or the token expires (typically up to 30 days per our auth configuration).</p>
<p><strong>MMKV cache</strong> — until cleared by the app, sign-out, or uninstall.</p>
<p><strong>Website analytics</strong> — per Vercel's retention settings.</p>
<p><strong>MailerLite</strong> — until you unsubscribe or we delete your marketing profile.</p>`,
        },
        {
            id: 'managing',
            navLabel: 'Your choices',
            eyebrow: '7',
            title: 'Managing preferences',
            body: `<p><strong>Mobile app:</strong> sign out to clear session tokens; adjust notification permissions in device settings; uninstall the app to remove local storage.</p>
<p><strong>Website:</strong> clear browser cookies or use private browsing; unsubscribe from marketing emails via MailerLite links in each message.</p>
<p>See our <a href="/legal/listener/privacy-policy">Privacy Policy</a> for broader data rights.</p>`,
        },
        {
            id: 'contact',
            navLabel: 'Contact',
            eyebrow: '8',
            title: 'Contact',
            body: `<p>Questions about cookies or storage: <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>`,
        },
    ],
};

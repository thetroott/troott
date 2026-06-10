import type { LegalDocument } from '../types';

const LAST_UPDATED = 'March 2026';

export const ministerCookies: LegalDocument = {
    audience: 'minister',
    slug: 'cookies',
    label: '// Legal · // Minister · Cookies',
    heading: 'Cookie policy',
    headingMuted: `how we use cookies in Studio · Last updated ${LAST_UPDATED}`,
    lastUpdated: '2026-03-01',
    sourceRefs: ['apps/web/src/api/services/cookies.ts', 'apps/web/src/components/ui/sidebar.tsx'],
    sections: [
        {
            id: 'overview',
            navLabel: 'Overview',
            eyebrow: '1',
            title: 'Overview',
            body: `<p>Troott Studio (app.troott.com) is a web application that uses cookies and browser storage to keep you signed in and remember preferences.</p>`,
        },
        {
            id: 'essential',
            navLabel: 'Essential',
            eyebrow: '2',
            title: 'Essential cookies and storage',
            body: `<p>When you sign in, we set cookies and local storage entries including:</p>
<ul>
<li><strong>token</strong> — authentication session (approximately 24 hours).</li>
<li><strong>userId, userType, userEmail, businessType</strong> — session context.</li>
<li><strong>studioCode</strong> — active studio selection.</li>
<li><strong>x-hit</strong> — request idempotency for safe retries.</li>
</ul>
<p>These cookies are not httpOnly and are required for Studio to function. Signing out clears session cookies.</p>`,
        },
        {
            id: 'preferences',
            navLabel: 'Preferences',
            eyebrow: '3',
            title: 'Preference cookies',
            body: `<p><strong>sidebar_state</strong> — remembers sidebar expanded/collapsed state for up to 7 days.</p>`,
        },
        {
            id: 'analytics',
            navLabel: 'Analytics',
            eyebrow: '4',
            title: 'Analytics',
            body: `<p>In production, Studio may use PostHog (including session recording), Sentry, and Reo. These services may set their own cookies or use local storage and may receive your user id and email to diagnose errors and understand product usage.</p>
<p>If you visit troott.com separately, Vercel Analytics and MailerLite may apply as described in the <a href="/legal/listener/cookies">listener cookie policy</a>.</p>`,
        },
        {
            id: 'managing',
            navLabel: 'Managing',
            eyebrow: '5',
            title: 'Managing cookies',
            body: `<p>You can clear cookies via your browser settings or sign out of Studio. Clearing essential cookies will end your session. For questions, contact <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>`,
        },
    ],
};

import type { LegalDocument } from '../types';

const LAST_UPDATED = 'June 2026';

export const ministerCookies: LegalDocument = {
    audience: 'minister',
    slug: 'cookies',
    label: '// Legal · // Minister · Cookies',
    heading: 'Cookie policy',
    headingMuted: `how we use cookies in Studio · Last updated ${LAST_UPDATED}`,
    lastUpdated: '2026-06-02',
    sourceRefs: [
        'apps/web/src/api/services/cookies.ts',
        'apps/web/src/components/ui/sidebar.tsx',
        'specs/website/feature/feat-0017/LEGAL_CONTENT_MATRIX.md',
    ],
    sections: [
        {
            id: 'overview',
            navLabel: 'Overview',
            eyebrow: '1',
            title: 'Overview',
            body: `<p>Troott Studio (<a href="https://app.troott.com">app.troott.com</a>) is a web application that uses cookies and browser storage to keep you signed in, remember preferences, and operate analytics in production environments.</p>
<p>This policy describes cookies and similar technologies when you access Studio in a browser.</p>`,
        },
        {
            id: 'essential',
            navLabel: 'Essential',
            eyebrow: '2',
            title: 'Essential cookies and storage',
            body: `<p>When you sign in, we set cookies and local storage entries required for Studio to function:</p>
<ul>
<li><strong>token</strong> — authentication session (approximately 24 hours).</li>
<li><strong>userId</strong> — identifies your account session.</li>
<li><strong>userType</strong> — role routing within Studio.</li>
<li><strong>userEmail</strong> — account context for display and support.</li>
<li><strong>businessType</strong> — studio business context.</li>
<li><strong>studioCode</strong> — active studio selection.</li>
<li><strong>x-hit</strong> — request idempotency for safe API retries.</li>
</ul>
<p>These cookies are not httpOnly. Signing out clears session cookies.</p>`,
        },
        {
            id: 'preferences',
            navLabel: 'Preferences',
            eyebrow: '3',
            title: 'Preference cookies',
            body: `<p><strong>sidebar_state</strong> — remembers whether the Studio sidebar is expanded or collapsed. Duration: up to 7 days.</p>
<p>Preference cookies are not strictly required but improve your experience.</p>`,
        },
        {
            id: 'analytics',
            navLabel: 'Analytics',
            eyebrow: '4',
            title: 'Analytics and monitoring',
            body: `<p>In production, Studio may use:</p>
<ul>
<li><strong>PostHog</strong> — product analytics, which may include session recording.</li>
<li><strong>Sentry</strong> — error monitoring.</li>
<li><strong>Reo</strong> — observability.</li>
</ul>
<p>These services may set their own cookies or use local storage and may receive your user id and email to diagnose errors and understand usage. <!-- PRODUCT_DECISION: consent banner before claiming consent basis --></p>`,
        },
        {
            id: 'security',
            navLabel: 'Security',
            eyebrow: '5',
            title: 'Security cookies',
            body: `<p>The <strong>x-hit</strong> idempotency cookie helps prevent duplicate API operations when you retry actions. It supports service reliability and abuse prevention.</p>`,
        },
        {
            id: 'third-parties',
            navLabel: 'Third parties',
            eyebrow: '6',
            title: 'Third-party cookies',
            body: `<p>Third parties that may set cookies when you use Studio or linked services include PostHog, Sentry, Reo, and OAuth providers (Google, Apple, GitHub) during sign-in flows.</p>
<p>If you visit <a href="https://troott.com">troott.com</a> separately, Vercel Analytics and MailerLite may apply as described in the <a href="/legal/listener/cookies">listener cookie policy</a>.</p>`,
        },
        {
            id: 'managing',
            navLabel: 'Managing',
            eyebrow: '7',
            title: 'Managing cookies',
            body: `<p>You can clear cookies via your browser settings or sign out of Studio. Clearing essential cookies will end your session.</p>
<p>Disabling analytics cookies may limit our ability to diagnose issues you report. For questions, contact <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>`,
        },
        {
            id: 'contact',
            navLabel: 'Contact',
            eyebrow: '8',
            title: 'Contact',
            body: `<p>Cookie questions: <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>`,
        },
    ],
};

import type { LegalDocument } from '../types';

const LAST_UPDATED = 'March 2026';

export const listenerGdpr: LegalDocument = {
    audience: 'listener',
    slug: 'gdpr',
    label: '// Legal · // Listener · GDPR',
    heading: 'GDPR',
    headingMuted: `your data rights · Last updated ${LAST_UPDATED}`,
    lastUpdated: '2026-03-01',
    sourceRefs: ['specs/api/mobile-flow.md', 'apps/api/src/controllers/user.controller.ts'],
    sections: [
        {
            id: 'controller',
            navLabel: 'Controller',
            eyebrow: '1',
            title: 'Data controller',
            body: `<p>For UK and European Economic Area (EEA) data protection law, Troott Technologies is the data controller for personal data processed through the Troott listener app.</p>
<p>Contact: <a href="mailto:hello@troott.com">hello@troott.com</a></p>`,
        },
        {
            id: 'lawful-bases',
            navLabel: 'Lawful bases',
            eyebrow: '2',
            title: 'Lawful bases for processing',
            body: `<ul>
<li><strong>Contract</strong> — to provide your account, streaming, and library features you request.</li>
<li><strong>Legitimate interests</strong> — to secure our services, prevent abuse, and improve recommendations and reliability, balanced against your rights.</li>
<li><strong>Consent</strong> — for optional marketing emails and push notifications where required.</li>
<li><strong>Legal obligation</strong> — where we must retain or disclose data by law.</li>
</ul>`,
        },
        {
            id: 'rights',
            navLabel: 'Your rights',
            eyebrow: '3',
            title: 'Your rights',
            body: `<p>Subject to applicable law, you may have the right to:</p>
<ul>
<li>Access the personal data we hold about you.</li>
<li>Rectify inaccurate data.</li>
<li>Erase data in certain circumstances.</li>
<li>Restrict or object to certain processing.</li>
<li>Data portability — receive a copy in a structured format.</li>
<li>Withdraw consent where processing is consent-based.</li>
</ul>`,
        },
        {
            id: 'exercise-rights',
            navLabel: 'Exercise rights',
            eyebrow: '4',
            title: 'How to exercise your rights',
            body: `<p>Email <a href="mailto:hello@troott.com">hello@troott.com</a> from your registered address. We may ask you to verify your identity. We aim to respond within one month.</p>
<p>You can deactivate your account in the app (About Troott). Self-serve data export is not yet available — request a copy by email.</p>`,
        },
        {
            id: 'transfers',
            navLabel: 'Transfers',
            eyebrow: '5',
            title: 'International transfers',
            body: `<p>We use infrastructure and subprocessors that may process data outside your country, including in the United States (for example AWS, analytics, and crash reporting). Where required, we rely on appropriate safeguards such as standard contractual clauses.</p>`,
        },
        {
            id: 'complaints',
            navLabel: 'Complaints',
            eyebrow: '6',
            title: 'Complaints',
            body: `<p>You may lodge a complaint with your local supervisory authority. We encourage you to contact us first at <a href="mailto:hello@troott.com">hello@troott.com</a> so we can address your concern.</p>`,
        },
    ],
};

import type { LegalDocument } from '../types';

const LAST_UPDATED = 'June 2026';

export const listenerGdpr: LegalDocument = {
    audience: 'listener',
    slug: 'gdpr',
    label: '// Legal · // Listener · GDPR',
    heading: 'GDPR',
    headingMuted: `your data rights · Last updated ${LAST_UPDATED}`,
    lastUpdated: '2026-06-02',
    sourceRefs: [
        'specs/api/mobile-flow.md',
        'apps/api/src/controllers/user.controller.ts',
        'specs/website/feature/feat-0017/LEGAL_CONTENT_MATRIX.md',
    ],
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
            id: 'scope',
            navLabel: 'Scope',
            eyebrow: '2',
            title: 'Scope',
            body: `<p>This page supplements our <a href="/legal/listener/privacy-policy">Privacy Policy</a> for listeners in the UK and EEA. It describes your rights under the UK GDPR and EU GDPR where applicable.</p>
<p>Ministers using Troott Studio should read <a href="/legal/minister/gdpr">Minister GDPR information</a>.</p>`,
        },
        {
            id: 'lawful-bases',
            navLabel: 'Lawful bases',
            eyebrow: '3',
            title: 'Lawful bases for processing',
            body: `<p>We process personal data on the following bases:</p>
<ul>
<li><strong>Contract (Art. 6(1)(b))</strong> — account registration, streaming, library sync, playlists, and subscriptions you request.</li>
<li><strong>Legitimate interests (Art. 6(1)(f))</strong> — security, fraud prevention, service improvement, and recommendations, balanced against your rights.</li>
<li><strong>Consent (Art. 6(1)(a))</strong> — optional marketing emails and push notifications where required.</li>
<li><strong>Legal obligation (Art. 6(1)(c))</strong> — retention and disclosure required by law.</li>
</ul>`,
        },
        {
            id: 'rights',
            navLabel: 'Your rights',
            eyebrow: '4',
            title: 'Your rights',
            body: `<p>Subject to applicable law, you may have the right to:</p>
<ul>
<li><strong>Access</strong> (Art. 15) — obtain confirmation and a copy of your personal data.</li>
<li><strong>Rectification</strong> (Art. 16) — correct inaccurate data.</li>
<li><strong>Erasure</strong> (Art. 17) — request deletion in certain circumstances.</li>
<li><strong>Restriction</strong> (Art. 18) — limit how we use your data.</li>
<li><strong>Portability</strong> (Art. 20) — receive data in a structured, machine-readable format.</li>
<li><strong>Object</strong> (Art. 21) — object to processing based on legitimate interests or direct marketing.</li>
<li><strong>Withdraw consent</strong> — where processing is consent-based, without affecting prior lawful processing.</li>
</ul>`,
        },
        {
            id: 'exercise-rights',
            navLabel: 'Exercise rights',
            eyebrow: '5',
            title: 'How to exercise your rights',
            body: `<p>Email <a href="mailto:hello@troott.com">hello@troott.com</a> from your registered address with the right you wish to exercise. We may ask you to verify your identity.</p>
<p>You can deactivate your account in the app (About Troott). Self-serve data export is not yet available — request a copy by email.</p>`,
        },
        {
            id: 'response-times',
            navLabel: 'Response times',
            eyebrow: '6',
            title: 'Response times',
            body: `<p>We aim to respond within one month of receiving a valid request. Complex requests may be extended by up to two additional months where permitted by law; we will inform you if an extension is needed.</p>`,
        },
        {
            id: 'processors',
            navLabel: 'Processors',
            eyebrow: '7',
            title: 'Processors and subprocessors',
            body: `<p>We use processors including AWS, MongoDB, Redis, Paystack, Bugsnag, PostHog (when enabled), Google/Apple OAuth, and email providers. Each processes data on our instructions for the purposes described in our <a href="/legal/listener/privacy-policy">Privacy Policy</a>.</p>
<p>A detailed subprocessor list is available on request at <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>`,
        },
        {
            id: 'transfers',
            navLabel: 'Transfers',
            eyebrow: '8',
            title: 'International transfers',
            body: `<p>Personal data may be processed outside the UK/EEA, including in the United States (AWS, analytics, crash reporting). Where required, we use appropriate safeguards such as the UK International Data Transfer Agreement or EU Standard Contractual Clauses. <!-- LEGAL_REVIEW --></p>`,
        },
        {
            id: 'complaints',
            navLabel: 'Complaints',
            eyebrow: '9',
            title: 'Complaints',
            body: `<p>You may lodge a complaint with your local supervisory authority. We encourage you to contact us first at <a href="mailto:hello@troott.com">hello@troott.com</a> so we can address your concern.</p>
<p>UK residents may contact the Information Commissioner's Office (ICO). EEA residents may contact their member-state authority.</p>`,
        },
        {
            id: 'contact',
            navLabel: 'Contact',
            eyebrow: '10',
            title: 'Contact',
            body: `<p>Data protection enquiries: <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>
<p><!-- LEGAL_REVIEW: DPO appointment if required --></p>`,
        },
    ],
};

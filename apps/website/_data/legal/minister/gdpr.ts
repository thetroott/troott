import type { LegalDocument } from '../types';

const LAST_UPDATED = 'June 2026';

export const ministerGdpr: LegalDocument = {
    audience: 'minister',
    slug: 'gdpr',
    label: '// Legal · // Minister · GDPR',
    heading: 'GDPR',
    headingMuted: `your data rights as a minister · Last updated ${LAST_UPDATED}`,
    lastUpdated: '2026-06-02',
    sourceRefs: [
        'apps/api/src/models/core/minister.model.ts',
        'specs/website/feature/feat-0017/LEGAL_CONTENT_MATRIX.md',
    ],
    sections: [
        {
            id: 'controller',
            navLabel: 'Controller',
            eyebrow: '1',
            title: 'Data controller',
            body: `<p>Troott Technologies is the data controller for minister account data processed through Troott Studio. Contact: <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>
<p>This page supplements our <a href="/legal/minister/privacy-policy">Privacy Policy</a> for UK and EEA ministers.</p>`,
        },
        {
            id: 'scope',
            navLabel: 'Scope',
            eyebrow: '2',
            title: 'Scope',
            body: `<p>These rights apply to personal data we process about you as a Studio user — not to aggregated listener analytics you view in dashboards (which concerns listener data subject to the <a href="/legal/listener/gdpr">Listener GDPR page</a>).</p>`,
        },
        {
            id: 'special-categories',
            navLabel: 'Sensitive data',
            eyebrow: '3',
            title: 'Identity documents and sensitive data',
            body: `<p>Government ID images submitted for verification may reveal special-category data under GDPR Article 9. We process this only for identity verification and fraud prevention, with restricted admin access, encryption via our cloud providers, and retention limited to what is necessary.</p>
<p>Lawful bases may include contract (providing Studio), legal obligation, and legitimate interests in preventing impersonation. <!-- LEGAL_REVIEW: explicit Art. 9 condition --></p>`,
        },
        {
            id: 'lawful-bases',
            navLabel: 'Lawful bases',
            eyebrow: '4',
            title: 'Lawful bases for processing',
            body: `<ul>
<li><strong>Contract</strong> — Studio registration, publishing, analytics, billing, and team features.</li>
<li><strong>Legitimate interests</strong> — security, fraud prevention, service improvement.</li>
<li><strong>Consent</strong> — where required for optional marketing.</li>
<li><strong>Legal obligation</strong> — compliance and lawful requests.</li>
</ul>`,
        },
        {
            id: 'rights',
            navLabel: 'Your rights',
            eyebrow: '5',
            title: 'Your rights',
            body: `<p>You may have the right to access, rectify, erase, restrict, object to, and port your personal data, subject to limitations when:</p>
<ul>
<li>Published sermon content must remain available to listeners;</li>
<li>Verification records must be retained for compliance;</li>
<li>Legal claims require retention.</li>
</ul>
<p>Analytics export permissions inside Studio are separate from personal data portability requests to Troott.</p>`,
        },
        {
            id: 'exercise-rights',
            navLabel: 'Exercise rights',
            eyebrow: '6',
            title: 'How to exercise your rights',
            body: `<p>Email <a href="mailto:hello@troott.com">hello@troott.com</a> from your registered address. We may verify your identity before processing ID document copy requests or erasure requests.</p>
<p>We aim to respond within one month.</p>`,
        },
        {
            id: 'processors',
            navLabel: 'Processors',
            eyebrow: '7',
            title: 'Processors and subprocessors',
            body: `<p>Minister-facing processors include AWS, MongoDB, Redis, Paystack, email providers (MailerSend, Zeptomail, SMTP), PostHog, Sentry, and Reo.</p>
<p>A current subprocessor list is available on request at <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>`,
        },
        {
            id: 'transfers',
            navLabel: 'Transfers',
            eyebrow: '8',
            title: 'International transfers',
            body: `<p>Data may be processed outside the UK/EEA, including in the United States. We use appropriate safeguards where required by law. <!-- LEGAL_REVIEW --></p>`,
        },
        {
            id: 'complaints',
            navLabel: 'Complaints',
            eyebrow: '9',
            title: 'Complaints',
            body: `<p>Contact us first at <a href="mailto:hello@troott.com">hello@troott.com</a>. You may also complain to your local data protection authority (for example the ICO in the UK).</p>`,
        },
        {
            id: 'contact',
            navLabel: 'Contact',
            eyebrow: '10',
            title: 'Contact',
            body: `<p>Data protection enquiries: <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>`,
        },
    ],
};

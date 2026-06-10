import type { LegalDocument } from '../types';

const LAST_UPDATED = 'March 2026';

export const ministerGdpr: LegalDocument = {
    audience: 'minister',
    slug: 'gdpr',
    label: '// Legal · // Minister · GDPR',
    heading: 'GDPR',
    headingMuted: `your data rights as a minister · Last updated ${LAST_UPDATED}`,
    lastUpdated: '2026-03-01',
    sourceRefs: ['apps/api/src/models/core/minister.model.ts'],
    sections: [
        {
            id: 'controller',
            navLabel: 'Controller',
            eyebrow: '1',
            title: 'Data controller',
            body: `<p>Troott Technologies is the data controller for minister account data processed through Troott Studio. Contact: <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>`,
        },
        {
            id: 'special-categories',
            navLabel: 'Sensitive data',
            eyebrow: '2',
            title: 'Identity documents',
            body: `<p>Government ID images submitted for verification may reveal special-category data. We process this only for verification and fraud prevention, with restricted admin access, encryption in transit and at rest via our cloud providers, and retention limited to what is necessary for compliance and safety.</p>
<p>Lawful bases may include contract (providing Studio), legal obligation, and legitimate interests in preventing impersonation and abuse.</p>`,
        },
        {
            id: 'rights',
            navLabel: 'Your rights',
            eyebrow: '3',
            title: 'Your rights',
            body: `<p>You have the same categories of rights as described for listeners — access, rectification, erasure, restriction, objection, and portability — subject to limitations when retention is required for published content, legal claims, or verification records.</p>
<p>Analytics export permissions in Studio are separate from personal data portability requests to Troott.</p>`,
        },
        {
            id: 'processors',
            navLabel: 'Processors',
            eyebrow: '4',
            title: 'Processors',
            body: `<p>Our minister-facing subprocessors include AWS, MongoDB, Redis, Paystack, email providers, PostHog, Sentry, and Reo. A current list is available on request at <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>`,
        },
        {
            id: 'transfers',
            navLabel: 'Transfers',
            eyebrow: '5',
            title: 'International transfers',
            body: `<p>Data may be processed outside the UK/EEA, including in the United States. We use appropriate safeguards where required by law.</p>`,
        },
        {
            id: 'complaints',
            navLabel: 'Complaints',
            eyebrow: '6',
            title: 'Complaints',
            body: `<p>Contact us first at <a href="mailto:hello@troott.com">hello@troott.com</a>. You may also complain to your local data protection authority.</p>`,
        },
    ],
};

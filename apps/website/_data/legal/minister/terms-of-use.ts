import type { LegalDocument } from '../types';

const LAST_UPDATED = 'March 2026';

export const ministerTermsOfUse: LegalDocument = {
    audience: 'minister',
    slug: 'terms-of-use',
    label: '// Legal · // Minister · Terms of Use',
    heading: 'Terms of use',
    headingMuted: `for Troott Studio · Last updated ${LAST_UPDATED}`,
    lastUpdated: '2026-03-01',
    sourceRefs: [
        'apps/api/src/_data/roles.json',
        'apps/web/src/components/shared/get-started/VerifyDocument.tsx',
        '.cursor/rules/studio-sermon-published-delete-policy.mdc',
    ],
    sections: [
        {
            id: 'acceptance',
            navLabel: 'Acceptance',
            eyebrow: '1',
            title: 'Acceptance of terms',
            body: `<p>By registering for Troott Studio, completing minister verification, or uploading content, you agree to these Terms of Use for ministers and creators. If you act on behalf of a church or organisation, you represent that you have authority to bind that entity.</p>`,
        },
        {
            id: 'studio-service',
            navLabel: 'Studio service',
            eyebrow: '2',
            title: 'Troott Studio service',
            body: `<p>Studio (app.troott.com) lets you upload sermon audio, manage metadata, organise series and playlists, view listener analytics, invite team members, and publish content to Troott listeners.</p>
<p>Features may vary by plan. We may modify or discontinue features with reasonable notice where practicable.</p>`,
        },
        {
            id: 'verification',
            navLabel: 'Verification',
            eyebrow: '3',
            title: 'Minister verification',
            body: `<p>To publish publicly, you must complete identity and ministry verification, which may require submitting government-issued identification (such as national ID, driver's licence, or passport) and ministry details. You agree that information provided is accurate and that you will cooperate with reasonable verification requests.</p>
<p>We may reject or revoke verification if information is false, incomplete, or if you violate these terms.</p>`,
        },
        {
            id: 'your-content',
            navLabel: 'Your content',
            eyebrow: '4',
            title: 'Your content and licence',
            body: `<p>You retain ownership of sermons and materials you upload. You grant Troott a worldwide, non-exclusive licence to host, transcode, stream, distribute, and display your content to listeners as part of the Troott service, and to use thumbnails and metadata for promotion within the platform.</p>
<p>You represent that you have all rights necessary to upload and distribute your content and that it does not infringe third-party rights.</p>
<p><strong>Published content:</strong> Once a sermon is published, ministers may not move it to bin or permanently delete it without administrator involvement. This supports listener libraries and link stability.</p>`,
        },
        {
            id: 'teams',
            navLabel: 'Teams',
            eyebrow: '5',
            title: 'Teams and access',
            body: `<p>You may invite team members with role-based permissions. You are responsible for actions taken by users you invite and for maintaining appropriate access controls.</p>`,
        },
        {
            id: 'plans',
            navLabel: 'Plans',
            eyebrow: '6',
            title: 'Plans and billing',
            body: `<p>Paid Studio plans are billed through Paystack or other designated payment providers. Fees, renewal, and cancellation terms are shown at checkout and in your account settings.</p>`,
        },
        {
            id: 'termination',
            navLabel: 'Termination',
            eyebrow: '7',
            title: 'Suspension and deactivation',
            body: `<p>We may suspend Studio access for violations of these terms or applicable law. You may deactivate your account from Settings or by contacting <a href="mailto:hello@troott.com">hello@troott.com</a>. Deactivation limits access; retention of uploads and verification records is described in our <a href="/legal/minister/privacy-policy">Privacy Policy</a>.</p>`,
        },
        {
            id: 'contact',
            navLabel: 'Contact',
            eyebrow: '8',
            title: 'Contact',
            body: `<p><a href="mailto:hello@troott.com">hello@troott.com</a></p>`,
        },
    ],
};

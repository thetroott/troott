import type { LegalDocument } from '../types';

const LAST_UPDATED = 'June 2026';

export const ministerTermsOfUse: LegalDocument = {
    audience: 'minister',
    slug: 'terms-of-use',
    label: '// Legal · // Minister · Terms of Use',
    heading: 'Terms of use',
    headingMuted: `for Troott Studio · Last updated ${LAST_UPDATED}`,
    lastUpdated: '2026-06-02',
    sourceRefs: [
        'apps/api/src/_data/roles.json',
        'apps/web/src/components/shared/get-started/VerifyDocument.tsx',
        '.cursor/rules/studio-sermon-published-delete-policy.mdc',
        'specs/website/feature/feat-0017/LEGAL_CONTENT_MATRIX.md',
    ],
    sections: [
        {
            id: 'acceptance',
            navLabel: 'Acceptance',
            eyebrow: '1',
            title: 'Acceptance of terms',
            body: `<p>By registering for Troott Studio at <a href="https://app.troott.com">app.troott.com</a>, completing minister verification, or uploading content, you agree to these Terms of Use and our <a href="/legal/minister/privacy-policy">Privacy Policy</a>.</p>
<p>If you act on behalf of a church or organisation, you represent that you have authority to bind that entity. If you do not agree, do not use Studio.</p>`,
        },
        {
            id: 'studio-service',
            navLabel: 'Studio service',
            eyebrow: '2',
            title: 'Troott Studio service',
            body: `<p>Studio lets you upload sermon audio, manage metadata, organise series and playlists, view listener analytics, invite team members, generate shareable links, and publish content to Troott listeners on mobile and web.</p>
<p>Features may vary by plan. We may modify or discontinue features with reasonable notice where practicable.</p>`,
        },
        {
            id: 'eligibility',
            navLabel: 'Eligibility',
            eyebrow: '3',
            title: 'Eligibility and representation',
            body: `<p>You must be authorised to speak on behalf of the ministry or organisation you register. You must provide accurate ministry and contact information and comply with applicable laws in territories where your content is distributed.</p>
<p>You may not use Studio if you are barred under applicable law or if we have suspended your account.</p>`,
        },
        {
            id: 'verification',
            navLabel: 'Verification',
            eyebrow: '4',
            title: 'Minister verification',
            body: `<p>To publish publicly, you must complete identity and ministry verification, which may require submitting government-issued identification (national ID, driver's licence, or passport) and ministry details.</p>
<p>You agree information provided is accurate and that you will cooperate with reasonable verification requests. We may reject or revoke verification if information is false, incomplete, or if you violate these terms.</p>`,
        },
        {
            id: 'your-content',
            navLabel: 'Your content',
            eyebrow: '5',
            title: 'Your content and licence to Troott',
            body: `<p>You retain ownership of sermons and materials you upload. You grant Troott a worldwide, non-exclusive, royalty-free licence to host, transcode, stream, distribute, display thumbnails and metadata, and promote your content within the Troott platform as necessary to operate the service.</p>
<p>You represent that you have all rights necessary to upload and distribute your content and that it does not infringe third-party intellectual property or privacy rights.</p>`,
        },
        {
            id: 'content-standards',
            navLabel: 'Content standards',
            eyebrow: '6',
            title: 'Content standards',
            body: `<p>Content must comply with applicable law. You must not upload content that is unlawful, defamatory, harassing, hateful, sexually explicit, fraudulent, or that promotes violence or illegal activity.</p>
<p>Troott is a Christian audio platform; content should align with the purpose of sharing sermons and teachings. We may remove content or suspend accounts that violate these standards.</p>`,
        },
        {
            id: 'published-sermons',
            navLabel: 'Published sermons',
            eyebrow: '7',
            title: 'Published sermon retention',
            body: `<p><strong>Once a sermon is published, ministers may not move it to bin or permanently delete it without administrator involvement.</strong> This supports listener libraries, playlists, and link stability.</p>
<p>Contact <a href="mailto:hello@troott.com">hello@troott.com</a> for exceptional takedown requests involving legal or rights issues.</p>`,
        },
        {
            id: 'teams',
            navLabel: 'Teams',
            eyebrow: '8',
            title: 'Teams and access',
            body: `<p>You may invite team members with role-based permissions defined in Studio. You are responsible for actions taken by users you invite and for maintaining appropriate access controls.</p>
<p>Revoke access promptly when collaborators leave your organisation.</p>`,
        },
        {
            id: 'plans',
            navLabel: 'Plans',
            eyebrow: '9',
            title: 'Plans and billing',
            body: `<p>Paid Studio plans are billed through Paystack or other designated payment providers. Fees, renewal, and cancellation terms are shown at checkout and in your account settings. Failure to pay may result in feature restrictions.</p>`,
        },
        {
            id: 'analytics',
            navLabel: 'Analytics',
            eyebrow: '10',
            title: 'Analytics',
            body: `<p>Studio provides aggregated analytics about listener engagement with your content. You must not attempt to re-identify individual listeners from analytics data or combine it with external data in ways that violate listener privacy or our <a href="/legal/listener/privacy-policy">Listener Privacy Policy</a>.</p>`,
        },
        {
            id: 'trust-and-safety',
            navLabel: 'Trust & safety',
            eyebrow: '11',
            title: 'Trust and safety',
            body: `<p>You must not impersonate others, upload misleading metadata, spam listeners, or use Troott to distribute malware or phishing content.</p>
<p>We may warn, restrict publishing, suspend Studio access, or deactivate accounts for violations. Report concerns to <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>`,
        },
        {
            id: 'intellectual-property',
            navLabel: 'IP',
            eyebrow: '12',
            title: 'Intellectual property',
            body: `<p>Troott platform software, branding, and UI are owned by Troott Technologies. You may not use Troott trademarks without permission.</p>
<p>Copyright complaints: email <a href="mailto:hello@troott.com">hello@troott.com</a> with identification of the work, infringing material (sermon ID or URL), your contact details, and a good-faith statement. We may remove content and terminate repeat infringers where appropriate. <!-- LEGAL_REVIEW: DMCA agent --></p>`,
        },
        {
            id: 'termination',
            navLabel: 'Termination',
            eyebrow: '13',
            title: 'Suspension and deactivation',
            body: `<p>We may suspend Studio access for violations of these terms or applicable law. You may deactivate your account from Settings or by contacting <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>
<p>Deactivation limits access; retention of uploads, published sermons, and verification records is described in our <a href="/legal/minister/privacy-policy">Privacy Policy</a>.</p>`,
        },
        {
            id: 'disclaimers',
            navLabel: 'Disclaimers',
            eyebrow: '14',
            title: 'Disclaimers',
            body: `<p>Studio is provided "as is" without warranties of uninterrupted upload processing, specific listener reach, or error-free analytics. Troott does not guarantee theological outcomes or audience size.</p>`,
        },
        {
            id: 'liability',
            navLabel: 'Liability',
            eyebrow: '15',
            title: 'Limitation of liability',
            body: `<p>To the maximum extent permitted by law, Troott's liability for Studio-related claims is limited to amounts you paid Troott in the twelve months before the claim or <!-- LEGAL_REVIEW: cap -->. We are not liable for indirect or consequential damages. <!-- LEGAL_REVIEW --></p>`,
        },
        {
            id: 'contact',
            navLabel: 'Contact',
            eyebrow: '16',
            title: 'Contact',
            body: `<p>Studio terms questions: <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>
<p>Troott Technologies — <a href="https://app.troott.com">app.troott.com</a></p>`,
        },
    ],
};

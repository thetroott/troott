import type { LegalDocument } from '../types';

const LAST_UPDATED = 'June 2026';

export const listenerTermsOfUse: LegalDocument = {
    audience: 'listener',
    slug: 'terms-of-use',
    label: '// Legal · // Listener · Terms of Use',
    heading: 'Terms of use',
    headingMuted: `for Troott listeners · Last updated ${LAST_UPDATED}`,
    lastUpdated: '2026-06-02',
    sourceRefs: [
        'apps/mobile/docs/google-play-store-listing.md',
        'apps/api/src/_data/roles.json',
        'apps/api/src/controllers/user.controller.ts',
        'specs/website/feature/feat-0017/LEGAL_CONTENT_MATRIX.md',
    ],
    sections: [
        {
            id: 'acceptance',
            navLabel: 'Acceptance',
            eyebrow: '1',
            title: 'Acceptance of terms',
            body: `<p>By creating a Troott account, downloading the Troott mobile app, or using our listener services, you agree to these Terms of Use and our <a href="/legal/listener/privacy-policy">Privacy Policy</a>. If you do not agree, do not use Troott.</p>
<p>We may update these terms from time to time. Material changes will be communicated via the app, email, or this page. Continued use after changes take effect constitutes acceptance.</p>`,
        },
        {
            id: 'the-service',
            navLabel: 'The service',
            eyebrow: '2',
            title: 'The Troott listener service',
            body: `<p>Troott provides a mobile application for streaming sermons and Christian teachings from ministers you follow. Features include search, personalised recommendations, playlists, a personal library, background audio playback, and sharing links to sermons.</p>
<p>Sermon audio and related content are provided by third-party ministers and churches. Troott does not create sermon content and does not endorse the theological views expressed in user-generated content.</p>
<p>A Troott account is required to use the listener app. Guest listening is not supported.</p>`,
        },
        {
            id: 'eligibility',
            navLabel: 'Eligibility',
            eyebrow: '3',
            title: 'Eligibility',
            body: `<p>You must be old enough to enter a binding agreement in your jurisdiction <!-- LEGAL_REVIEW: confirm minimum age -->. You may maintain only one listener account unless we authorise otherwise.</p>
<p>You may not use Troott if you are barred from receiving services under applicable law or if we have previously suspended your account for violations.</p>`,
        },
        {
            id: 'accounts',
            navLabel: 'Accounts',
            eyebrow: '4',
            title: 'Your account',
            body: `<p>You must provide accurate registration information and keep your credentials secure. You are responsible for activity under your account.</p>
<p>You may sign in using email and password or supported OAuth providers (such as Google or Apple, where available). Do not share your account, attempt to access another user's account, or use Troott for unlawful purposes.</p>`,
        },
        {
            id: 'subscriptions',
            navLabel: 'Subscriptions',
            eyebrow: '5',
            title: 'Subscriptions and payments',
            body: `<p>Troott offers free and paid plans. Premium features and pricing are described in the app and on troott.com. Paid subscriptions are processed by our payment partner Paystack. Billing terms, renewal, and cancellation follow the plan you select and applicable payment-provider rules.</p>
<p>Refunds are handled according to the app store or payment channel through which you subscribed, where applicable. <!-- PRODUCT_DECISION: Terms of Sale — separate document or fold here -->.</p>`,
        },
        {
            id: 'content-licence',
            navLabel: 'Content licence',
            eyebrow: '6',
            title: 'Licence to access content',
            body: `<p>Sermons, images, and metadata remain the property of their respective ministers or rights holders. Troott grants you a limited, personal, non-transferable, non-exclusive licence to stream and access content through the app for private, non-commercial use unless the minister enables additional sharing features.</p>
<p>This licence ends when your account is deactivated or when we remove content from the service.</p>`,
        },
        {
            id: 'restrictions',
            navLabel: 'Restrictions',
            eyebrow: '7',
            title: 'Acceptable use restrictions',
            body: `<p>You agree not to:</p>
<ul>
<li>Download, copy, redistribute, or commercially exploit sermon content except where explicitly permitted in the app or by the rights holder.</li>
<li>Circumvent technical protections, access controls, or geographic restrictions.</li>
<li>Use bots, scrapers, or automated tools to access the service without permission.</li>
<li>Reverse engineer or interfere with the app or servers.</li>
<li>Use Troott for unlawful, harmful, or fraudulent activity.</li>
</ul>`,
        },
        {
            id: 'trust-and-safety',
            navLabel: 'Trust & safety',
            eyebrow: '8',
            title: 'Trust and safety',
            body: `<p>Troott is built for respectful listening and sharing of Christian teachings. You must not harass, threaten, impersonate others, spam, or post unlawful content through any feature that allows user input or sharing.</p>
<p>Report abuse, copyright concerns, or policy violations to <a href="mailto:hello@troott.com">hello@troott.com</a> with relevant sermon links or account details. We may investigate and take action including content removal, suspension, or account deactivation.</p>`,
        },
        {
            id: 'intellectual-property',
            navLabel: 'IP',
            eyebrow: '9',
            title: 'Intellectual property',
            body: `<p>Troott names, logos, app design, and platform software are owned by Troott Technologies or its licensors. You may not use Troott trademarks without written permission.</p>
<p>If you believe content on Troott infringes your copyright, email <a href="mailto:hello@troott.com">hello@troott.com</a> with: identification of the work, the infringing material (URL or sermon ID), your contact information, and a statement of good-faith belief. We will review and respond as appropriate. <!-- LEGAL_REVIEW: formal DMCA agent if US operations expand --></p>`,
        },
        {
            id: 'third-party',
            navLabel: 'Third parties',
            eyebrow: '10',
            title: 'Third-party content and links',
            body: `<p>Ministers and churches are independent third-party content providers. Troott is not responsible for the accuracy, completeness, or theology of their sermons.</p>
<p>The app may link to external websites or services. We are not responsible for third-party sites, their privacy practices, or their terms.</p>`,
        },
        {
            id: 'disclaimers',
            navLabel: 'Disclaimers',
            eyebrow: '11',
            title: 'Disclaimers',
            body: `<p>Troott is provided "as is" and "as available" without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement.</p>
<p>We do not guarantee uninterrupted streaming, error-free operation, or that content will always remain available.</p>`,
        },
        {
            id: 'liability',
            navLabel: 'Liability',
            eyebrow: '12',
            title: 'Limitation of liability',
            body: `<p>To the maximum extent permitted by law, Troott Technologies and its affiliates will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill arising from your use of the service.</p>
<p>Our total liability for claims relating to the service is limited to the greater of (a) amounts you paid Troott in the twelve months before the claim or (b) <!-- LEGAL_REVIEW: monetary cap amount -->. Some jurisdictions do not allow certain limitations; in those cases our liability is limited to the fullest extent permitted by law.</p>`,
        },
        {
            id: 'indemnity',
            navLabel: 'Indemnity',
            eyebrow: '13',
            title: 'Indemnity',
            body: `<p>You agree to indemnify and hold harmless Troott Technologies and its officers, directors, employees, and agents from claims, damages, and expenses (including reasonable legal fees) arising from your misuse of the service, violation of these terms, or infringement of third-party rights. <!-- LEGAL_REVIEW: counsel approval --></p>`,
        },
        {
            id: 'termination',
            navLabel: 'Termination',
            eyebrow: '14',
            title: 'Suspension and account deactivation',
            body: `<p>We may suspend or restrict access if you violate these terms or if required by law. You may deactivate your account from the app (About Troott) or by contacting <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>
<p>Deactivating your account limits access to Troott services. We may retain certain data as described in our <a href="/legal/listener/privacy-policy">Privacy Policy</a> and as required by law. Deactivation is not a guarantee of immediate erasure of all personal data.</p>`,
        },
        {
            id: 'governing-law',
            navLabel: 'Governing law',
            eyebrow: '15',
            title: 'Governing law and disputes',
            body: `<p>These terms are governed by the laws of <!-- LEGAL_REVIEW: Nigeria / England and Wales / other -->, without regard to conflict-of-law principles.</p>
<p>Disputes will be resolved in the courts of <!-- LEGAL_REVIEW: venue -->, unless mandatory consumer protection laws in your country require otherwise.</p>`,
        },
        {
            id: 'contact',
            navLabel: 'Contact',
            eyebrow: '16',
            title: 'Contact',
            body: `<p>Questions about these terms: <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>
<p>Troott Technologies — <a href="https://troott.com">troott.com</a></p>`,
        },
    ],
};

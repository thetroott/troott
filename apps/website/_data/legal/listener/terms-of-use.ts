import type { LegalDocument } from '../types';

const LAST_UPDATED = 'March 2026';

export const listenerTermsOfUse: LegalDocument = {
    audience: 'listener',
    slug: 'terms-of-use',
    label: '// Legal · // Listener · Terms of Use',
    heading: 'Terms of use',
    headingMuted: `for Troott listeners · Last updated ${LAST_UPDATED}`,
    lastUpdated: '2026-03-01',
    sourceRefs: [
        'apps/mobile/docs/google-play-store-listing.md',
        'apps/api/src/_data/roles.json',
        'apps/api/src/controllers/user.controller.ts',
    ],
    sections: [
        {
            id: 'acceptance',
            navLabel: 'Acceptance',
            eyebrow: '1',
            title: 'Acceptance of terms',
            body: `<p>By creating a Troott account, downloading the Troott mobile app, or using our listener services, you agree to these Terms of Use. If you do not agree, do not use Troott.</p>
<p>We may update these terms from time to time. Material changes will be communicated via the app, email, or this page. Continued use after changes take effect constitutes acceptance.</p>`,
        },
        {
            id: 'the-service',
            navLabel: 'The service',
            eyebrow: '2',
            title: 'The Troott listener service',
            body: `<p>Troott provides a mobile application for streaming sermons and Christian teachings from ministers you follow. Features include search, personalised recommendations, playlists, a personal library, background audio playback, and sharing links to sermons.</p>
<p>Sermon audio and related content are provided by third-party ministers and churches. Troott does not create sermon content and is not responsible for the theological views expressed in user-generated content.</p>
<p>A Troott account is required to use the listener app. Guest listening is not supported.</p>`,
        },
        {
            id: 'accounts',
            navLabel: 'Accounts',
            eyebrow: '3',
            title: 'Your account',
            body: `<p>You must provide accurate registration information and keep your credentials secure. You are responsible for activity under your account.</p>
<p>You may sign in using email and password or supported OAuth providers (such as Google or Apple, where available). You must be old enough to enter a binding agreement in your jurisdiction. <!-- LEGAL_REVIEW: confirm minimum age -->.</p>
<p>Do not share your account, attempt to access another user's account, or use Troott for unlawful purposes.</p>`,
        },
        {
            id: 'subscriptions',
            navLabel: 'Subscriptions',
            eyebrow: '4',
            title: 'Subscriptions and payments',
            body: `<p>Troott offers free and paid plans. Premium features and pricing are described in the app and on troott.com. Paid subscriptions are processed by our payment partner Paystack. Billing terms, renewal, and cancellation follow the plan you select and applicable payment-provider rules.</p>
<p>Refunds are handled according to the app store or payment channel through which you subscribed, where applicable.</p>`,
        },
        {
            id: 'content',
            navLabel: 'Content',
            eyebrow: '5',
            title: 'Content and intellectual property',
            body: `<p>Sermons, images, and metadata remain the property of their respective ministers or rights holders. Troott grants you a limited, personal, non-transferable licence to stream and access content through the app for private, non-commercial use unless the minister enables additional sharing features.</p>
<p>You may not download, redistribute, or commercially exploit sermon content except where explicitly permitted in the app or by the rights holder.</p>`,
        },
        {
            id: 'termination',
            navLabel: 'Termination',
            eyebrow: '6',
            title: 'Suspension and account deactivation',
            body: `<p>We may suspend or restrict access if you violate these terms or if required by law. You may deactivate your account from the app (About Troott) or by contacting <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>
<p>Deactivating your account limits access to Troott services. We may retain certain data as described in our <a href="/legal/listener/privacy-policy">Privacy Policy</a> and as required by law. Hard deletion timelines, if any, will be described in our privacy documentation.</p>`,
        },
        {
            id: 'contact',
            navLabel: 'Contact',
            eyebrow: '7',
            title: 'Contact',
            body: `<p>Questions about these terms: <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>
<p>Troott Technologies — troott.com</p>`,
        },
    ],
};

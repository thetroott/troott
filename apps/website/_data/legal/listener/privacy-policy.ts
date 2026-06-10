import type { LegalDocument } from '../types';

const LAST_UPDATED = 'March 2026';

export const listenerPrivacyPolicy: LegalDocument = {
    audience: 'listener',
    slug: 'privacy-policy',
    label: '// Legal · // Listener · Privacy Policy',
    heading: 'Your privacy',
    headingMuted: `matters to us · Last updated ${LAST_UPDATED}`,
    lastUpdated: '2026-03-01',
    sourceRefs: [
        'apps/api/src/models/user.model.ts',
        'apps/api/src/models/core/listener.model.ts',
        'apps/mobile/docs/google-play-store-listing.md',
    ],
    sections: [
        {
            id: 'overview',
            navLabel: 'Overview',
            eyebrow: '1',
            title: 'Overview',
            body: `<p>This Privacy Policy explains how Troott Technologies ("Troott", "we", "us") collects, uses, and shares personal data when you use the Troott mobile app and listener account services.</p>
<p>Data controller contact: <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>`,
        },
        {
            id: 'data-we-collect',
            navLabel: 'Data we collect',
            eyebrow: '2',
            title: 'Data we collect',
            body: `<p><strong>Account and profile:</strong> name, email address, phone number (if provided), date of birth, gender, country, profile photo, and account preferences.</p>
<p><strong>Listening activity:</strong> sermons played, listening history, likes, playlists, library saves, followed ministers, topic interests selected during onboarding, and recent searches.</p>
<p><strong>Device and technical data:</strong> device identifiers, operating system, app version, crash logs, and playback session metadata (device type, network type) to deliver and improve the service.</p>
<p><strong>Payment data:</strong> when you subscribe, payment tokens and limited card metadata are processed by Paystack. We do not store full card numbers on our servers.</p>
<p><strong>Communications:</strong> support messages and notification preferences, including push notification tokens if you opt in.</p>
<p>We do not collect precise location data from the listener app.</p>`,
        },
        {
            id: 'how-we-use',
            navLabel: 'How we use data',
            eyebrow: '3',
            title: 'How we use your data',
            body: `<ul>
<li>Provide streaming, library sync, recommendations, and account features.</li>
<li>Process subscriptions and prevent fraud.</li>
<li>Send service, security, and (with consent) marketing communications.</li>
<li>Monitor crashes and usage to improve reliability and product experience.</li>
<li>Comply with legal obligations and enforce our terms.</li>
</ul>`,
        },
        {
            id: 'sharing',
            navLabel: 'Sharing',
            eyebrow: '4',
            title: 'Sharing and processors',
            body: `<p>We share data with service providers who help us operate Troott, including:</p>
<ul>
<li><strong>AWS</strong> — media storage and content delivery.</li>
<li><strong>MongoDB / Redis</strong> — application data and caching.</li>
<li><strong>Paystack</strong> — payment processing.</li>
<li><strong>Bugsnag</strong> — crash reporting (may include user id and email when logged in).</li>
<li><strong>PostHog</strong> — product analytics when enabled.</li>
<li><strong>Google / Apple</strong> — OAuth sign-in, where you choose those options.</li>
<li><strong>Email providers</strong> — transactional messages.</li>
</ul>
<p>We do not sell your personal data. Ministers may see aggregated analytics about listens to their own content, not your private library details.</p>`,
        },
        {
            id: 'retention',
            navLabel: 'Retention',
            eyebrow: '5',
            title: 'Retention',
            body: `<p>We retain personal data while your account is active and for a reasonable period afterward to comply with law, resolve disputes, and maintain security logs.</p>
<p>When you deactivate your account, we mark your account as inactive and limit processing. Some data may be retained in backups or as required by law. See our <a href="/legal/listener/gdpr">GDPR page</a> for rights requests.</p>`,
        },
        {
            id: 'your-rights',
            navLabel: 'Your rights',
            eyebrow: '6',
            title: 'Your rights',
            body: `<p>Depending on your location, you may have rights to access, correct, delete, or restrict processing of your data, and to object to certain processing. Self-serve data export is not yet available in the app — contact <a href="mailto:hello@troott.com">hello@troott.com</a> to exercise your rights.</p>
<p>See <a href="/legal/listener/gdpr">GDPR information</a> for UK/EEA residents.</p>`,
        },
        {
            id: 'children',
            navLabel: 'Children',
            eyebrow: '7',
            title: "Children's privacy",
            body: `<p>Troott is not directed at children under 13 <!-- LEGAL_REVIEW: confirm age threshold -->. We do not knowingly collect personal data from children. If you believe a child has provided us data, contact <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>`,
        },
    ],
};

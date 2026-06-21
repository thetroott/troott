import type { LegalDocument } from '../types';

const LAST_UPDATED = 'June 2026';

export const listenerPrivacyPolicy: LegalDocument = {
    audience: 'listener',
    slug: 'privacy-policy',
    label: '// Legal · // Listener · Privacy Policy',
    heading: 'Your privacy',
    headingMuted: `matters to us · Last updated ${LAST_UPDATED}`,
    lastUpdated: '2026-06-02',
    sourceRefs: [
        'apps/api/src/models/user.model.ts',
        'apps/api/src/models/core/listener.model.ts',
        'apps/api/src/models/core/playback-session.model.ts',
        'apps/mobile/docs/google-play-store-listing.md',
        'specs/website/feature/feat-0017/LEGAL_CONTENT_MATRIX.md',
    ],
    sections: [
        {
            id: 'overview',
            navLabel: 'Overview',
            eyebrow: '1',
            title: 'Overview',
            body: `<p>This Privacy Policy explains how Troott Technologies ("Troott", "we", "us") collects, uses, shares, and protects personal data when you use the Troott mobile app and listener account services at <a href="https://troott.com">troott.com</a>.</p>
<p>Troott is the data controller for listener personal data described here. Contact: <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>`,
        },
        {
            id: 'scope',
            navLabel: 'Scope',
            eyebrow: '2',
            title: 'Scope of this policy',
            body: `<p>This policy applies to personal data we process when you:</p>
<ul>
<li>Download, install, or use the Troott listener mobile app;</li>
<li>Create or manage a listener account;</li>
<li>Stream sermons, build playlists, or use in-app features tied to your account.</li>
</ul>
<p>It does not apply to ministers who publish content through Troott Studio — see <a href="/legal/minister/privacy-policy">Minister Privacy Policy</a>. If you subscribe to our marketing newsletter on troott.com, MailerLite processes that data under separate consent as described in our <a href="/legal/listener/cookies">Cookie Policy</a>.</p>`,
        },
        {
            id: 'data-we-collect',
            navLabel: 'Data we collect',
            eyebrow: '3',
            title: 'Personal data we collect',
            body: `<p><strong>Account and profile:</strong> name, email address, phone number (if provided), date of birth, gender, country, profile photo, and account preferences.</p>
<p><strong>Listening activity:</strong> sermons played, listening history, likes, playlists, library saves, followed ministers, topic interests selected during onboarding, and recent searches.</p>
<p><strong>Device and technical data:</strong> device identifiers, operating system, app version, crash logs, and playback session metadata (device type, network type) to deliver and improve the service.</p>
<p><strong>Payment data:</strong> when you subscribe, payment tokens and limited card metadata are processed by Paystack. We do not store full card numbers on our servers.</p>
<p><strong>Communications:</strong> support messages and notification preferences, including push notification tokens if you opt in.</p>
<p>We do not collect precise location data from the listener app.</p>`,
        },
        {
            id: 'sources',
            navLabel: 'Sources',
            eyebrow: '4',
            title: 'Sources of personal data',
            body: `<p>We collect personal data from:</p>
<ul>
<li><strong>You directly</strong> — when you register, complete onboarding, update your profile, contact support, or subscribe.</li>
<li><strong>Sign-in providers</strong> — when you choose Google or Apple OAuth, we receive profile information permitted by those services.</li>
<li><strong>Automatic collection</strong> — when you use the app, including playback events, crash reports, and session metadata.</li>
<li><strong>Ministers (indirectly)</strong> — sermon metadata and public minister profiles you interact with; ministers do not receive your private library details.</li>
</ul>`,
        },
        {
            id: 'how-we-use',
            navLabel: 'How we use data',
            eyebrow: '5',
            title: 'How we use your data',
            body: `<p>We use personal data to:</p>
<ul>
<li>Provide streaming, library sync, playlists, search, and account features you request.</li>
<li>Personalise recommendations based on ministers you follow, interests, and listening history.</li>
<li>Process subscriptions, billing, and fraud prevention through Paystack.</li>
<li>Send service messages, security alerts, and (with consent where required) marketing communications.</li>
<li>Monitor crashes and usage to improve reliability, performance, and product experience.</li>
<li>Enforce our <a href="/legal/listener/terms-of-use">Terms of Use</a>, protect users, and comply with legal obligations.</li>
</ul>`,
        },
        {
            id: 'legal-bases',
            navLabel: 'Legal bases',
            eyebrow: '6',
            title: 'Legal bases for processing',
            body: `<p>Where UK or EEA data protection law applies, we rely on:</p>
<ul>
<li><strong>Contract</strong> — to provide your account and listener features.</li>
<li><strong>Legitimate interests</strong> — to secure our services, prevent abuse, and improve recommendations, balanced against your rights.</li>
<li><strong>Consent</strong> — for optional marketing emails and push notifications where required.</li>
<li><strong>Legal obligation</strong> — where we must retain or disclose data by law.</li>
</ul>
<p>See <a href="/legal/listener/gdpr">GDPR information</a> for more detail.</p>`,
        },
        {
            id: 'sharing',
            navLabel: 'Sharing',
            eyebrow: '7',
            title: 'Sharing and processors',
            body: `<p>We share personal data with service providers who help us operate Troott, including:</p>
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
            id: 'automated-decisions',
            navLabel: 'Automated decisions',
            eyebrow: '8',
            title: 'Automated decisions and profiling',
            body: `<p>We use listening history, followed ministers, and stated interests to rank and recommend sermons. This is product personalisation, not a decision with legal or similarly significant effects on you.</p>
<p>We do not make solely automated decisions that produce legal effects concerning you without human involvement.</p>`,
        },
        {
            id: 'retention',
            navLabel: 'Retention',
            eyebrow: '9',
            title: 'How long we keep data',
            body: `<p>We retain personal data while your account is active and for a reasonable period afterward to comply with law, resolve disputes, and maintain security logs.</p>
<p>When you deactivate your account, we mark your account as inactive (<code>isDeactivated</code>) and limit processing. Some data may remain in backups or as required by law. We do not currently offer a guaranteed immediate hard-delete timeline for all data categories.</p>
<p>See our <a href="/legal/listener/gdpr">GDPR page</a> to request erasure where applicable.</p>`,
        },
        {
            id: 'security',
            navLabel: 'Security',
            eyebrow: '10',
            title: 'Security',
            body: `<p>We use reasonable technical and organisational measures to protect personal data, including encryption in transit, access controls, and secure token storage on your device (iOS Keychain / Android Keystore).</p>
<p>No method of transmission or storage is completely secure. We cannot guarantee absolute security.</p>`,
        },
        {
            id: 'international-transfers',
            navLabel: 'Transfers',
            eyebrow: '11',
            title: 'International transfers',
            body: `<p>We use infrastructure and subprocessors that may process data outside your country, including in the United States (for example AWS, analytics, and crash reporting).</p>
<p>Where required by law, we rely on appropriate safeguards such as standard contractual clauses. <!-- LEGAL_REVIEW: confirm transfer mechanisms for Nigeria, UK, and EEA users --></p>`,
        },
        {
            id: 'your-rights',
            navLabel: 'Your rights',
            eyebrow: '12',
            title: 'Your rights',
            body: `<p>Depending on your location, you may have the right to:</p>
<ul>
<li>Access the personal data we hold about you.</li>
<li>Correct inaccurate data.</li>
<li>Request erasure in certain circumstances.</li>
<li>Restrict or object to certain processing.</li>
<li>Receive a portable copy of your data.</li>
<li>Withdraw consent where processing is consent-based.</li>
</ul>
<p>Self-serve data export is not yet available in the app. Email <a href="mailto:hello@troott.com">hello@troott.com</a> to exercise your rights. See <a href="/legal/listener/gdpr">GDPR information</a> for UK/EEA residents.</p>`,
        },
        {
            id: 'children',
            navLabel: 'Children',
            eyebrow: '13',
            title: "Children's privacy",
            body: `<p>Troott is not directed at children under 13 <!-- LEGAL_REVIEW: confirm age threshold -->. We do not knowingly collect personal data from children below that age. If you believe a child has provided us data, contact <a href="mailto:hello@troott.com">hello@troott.com</a> and we will take appropriate steps.</p>`,
        },
        {
            id: 'changes',
            navLabel: 'Changes',
            eyebrow: '14',
            title: 'Changes to this policy',
            body: `<p>We may update this Privacy Policy from time to time. Material changes will be communicated via the app, email, or this page with an updated "Last updated" date. Continued use after changes take effect means you accept the updated policy.</p>`,
        },
        {
            id: 'contact',
            navLabel: 'Contact',
            eyebrow: '15',
            title: 'Contact us',
            body: `<p>Privacy questions or requests: <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>
<p>Troott Technologies — <a href="https://troott.com">troott.com</a></p>
<p>UK/EEA supervisory authority complaints are described on our <a href="/legal/listener/gdpr">GDPR page</a>.</p>`,
        },
    ],
};

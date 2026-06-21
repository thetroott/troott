import type { LegalDocument } from '../types';

const LAST_UPDATED = 'June 2026';

export const ministerPrivacyPolicy: LegalDocument = {
    audience: 'minister',
    slug: 'privacy-policy',
    label: '// Legal · // Minister · Privacy Policy',
    heading: 'Privacy policy',
    headingMuted: `how we handle creator data · Last updated ${LAST_UPDATED}`,
    lastUpdated: '2026-06-02',
    sourceRefs: [
        'apps/api/src/models/core/minister.model.ts',
        'apps/web/src/services/observability/ObservabilityUserSync.tsx',
        'apps/web/src/components/shared/get-started/VerifyDocument.tsx',
        'specs/website/feature/feat-0017/LEGAL_CONTENT_MATRIX.md',
    ],
    sections: [
        {
            id: 'overview',
            navLabel: 'Overview',
            eyebrow: '1',
            title: 'Overview',
            body: `<p>This Privacy Policy describes how Troott Technologies ("Troott", "we", "us") processes personal data when you use Troott Studio as a minister or creator at <a href="https://app.troott.com">app.troott.com</a>.</p>
<p>Troott is the data controller for minister account data described here. Contact: <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>`,
        },
        {
            id: 'scope',
            navLabel: 'Scope',
            eyebrow: '2',
            title: 'Scope of this policy',
            body: `<p>This policy applies to personal data we process when you register for Studio, complete verification, upload sermons, manage your ministry profile, invite team members, or use analytics and billing features.</p>
<p>It does not apply to listener app users — see <a href="/legal/listener/privacy-policy">Listener Privacy Policy</a>. Listener personal data you see in aggregated analytics is described below; you do not receive raw listener PII through Studio dashboards.</p>`,
        },
        {
            id: 'data-we-collect',
            navLabel: 'Data we collect',
            eyebrow: '3',
            title: 'Personal data we collect',
            body: `<p><strong>Account:</strong> name, email, phone, profile media, login history, and role assignments.</p>
<p><strong>Ministry profile:</strong> ministerial name, ministry name, logo, type, headquarters address, contact details, website, social links, and languages.</p>
<p><strong>Content:</strong> uploaded audio, thumbnails, titles, descriptions, tags, series metadata, and publishing status.</p>
<p><strong>Analytics:</strong> aggregated and per-sermon listener metrics made available to you in Studio dashboards.</p>
<p><strong>Team:</strong> invite records, email addresses of collaborators, and permission assignments.</p>
<p><strong>Billing:</strong> subscription status and payment metadata processed by Paystack.</p>`,
        },
        {
            id: 'identity-verification',
            navLabel: 'ID verification',
            eyebrow: '4',
            title: 'Identity verification documents',
            body: `<p>To verify ministers, we collect government-issued identification images (such as national ID, driver's licence, or passport) and related verification metadata. As stated in Studio: "Your ID will be used to verify your personal information."</p>
<p>These documents are used solely to confirm identity and ministry eligibility, accessed by authorised administrators, and stored securely on AWS infrastructure. Verification records may be retained for fraud prevention, legal compliance, and dispute resolution even after account deactivation where required by law. <!-- LEGAL_REVIEW: special category lawful basis Art. 9 --></p>`,
        },
        {
            id: 'sermon-data',
            navLabel: 'Sermon data',
            eyebrow: '5',
            title: 'Sermon and processing data',
            body: `<p>Uploaded sermons are processed for transcoding (including HLS delivery), storage, and streaming to listeners. We generate playback analytics (listen counts, session metadata) to provide Studio insights.</p>
<p>Shareable links may use time-limited tokens as configured in Studio. Published sermon media may remain available to listeners according to platform retention policies.</p>`,
        },
        {
            id: 'analytics',
            navLabel: 'Analytics',
            eyebrow: '6',
            title: 'Analytics we provide to you',
            body: `<p>Studio dashboards show aggregated listener engagement with your content. You see metrics such as play counts and trends — not individual listener library contents, private playlists, or contact details unless a separate product feature explicitly provides them with appropriate consent.</p>
<p>We also use product analytics (PostHog, Sentry, Reo in production) to improve Studio; those tools may receive your user id and email for error diagnosis.</p>`,
        },
        {
            id: 'how-we-use',
            navLabel: 'How we use data',
            eyebrow: '7',
            title: 'How we use your data',
            body: `<p>We use minister personal data to:</p>
<ul>
<li>Provide Studio features including upload, publish, analytics, team management, and billing.</li>
<li>Verify identity and prevent impersonation or fraud.</li>
<li>Deliver and improve sermon processing and listener distribution.</li>
<li>Communicate about your account, verification, security, and service updates.</li>
<li>Enforce our <a href="/legal/minister/terms-of-use">Terms of Use</a> and comply with legal obligations.</li>
</ul>`,
        },
        {
            id: 'legal-bases',
            navLabel: 'Legal bases',
            eyebrow: '8',
            title: 'Legal bases for processing',
            body: `<p>Where UK or EEA law applies, we rely on contract (providing Studio), legitimate interests (security, fraud prevention, product improvement), consent (where required for marketing), and legal obligation.</p>
<p>Processing of government ID may involve special-category data; we rely on <!-- LEGAL_REVIEW: Art. 9 basis --> and restrict access to authorised personnel.</p>
<p>See <a href="/legal/minister/gdpr">Minister GDPR information</a>.</p>`,
        },
        {
            id: 'sharing',
            navLabel: 'Sharing',
            eyebrow: '9',
            title: 'Sharing and processors',
            body: `<p>We use subprocessors including:</p>
<ul>
<li><strong>AWS</strong> — storage, CDN, and ID document storage.</li>
<li><strong>MongoDB / Redis</strong> — application data and caching.</li>
<li><strong>Paystack</strong> — payments and subscriptions.</li>
<li><strong>Email providers</strong> — MailerSend, Zeptomail, SMTP for transactional email.</li>
<li><strong>PostHog, Sentry, Reo</strong> — analytics and error monitoring in production Studio.</li>
</ul>
<p>We do not sell minister personal data.</p>`,
        },
        {
            id: 'retention',
            navLabel: 'Retention',
            eyebrow: '10',
            title: 'Retention',
            body: `<p><strong>Published sermons:</strong> may remain available to listeners even if you deactivate your account, subject to takedown requests, platform policy, and legal requirements. Ministers may not move published sermons to bin without administrator involvement.</p>
<p><strong>Verification documents:</strong> retained as needed for fraud prevention and compliance.</p>
<p><strong>Account data:</strong> retained while active and for a reasonable period after deactivation.</p>`,
        },
        {
            id: 'security',
            navLabel: 'Security',
            eyebrow: '11',
            title: 'Security and access controls',
            body: `<p>We use access controls, encryption in transit, and role-based permissions (RBAC) to limit who can view verification documents and minister account data. Only authorised administrators access ID verification files.</p>
<p>No system is completely secure; we cannot guarantee absolute protection.</p>`,
        },
        {
            id: 'international-transfers',
            navLabel: 'Transfers',
            eyebrow: '12',
            title: 'International transfers',
            body: `<p>Minister data may be processed outside your country, including in the United States via AWS and US-based observability vendors. Where required, we use appropriate safeguards such as standard contractual clauses. <!-- LEGAL_REVIEW --></p>`,
        },
        {
            id: 'your-rights',
            navLabel: 'Your rights',
            eyebrow: '13',
            title: 'Your rights',
            body: `<p>You have rights of access, rectification, erasure, restriction, objection, and portability subject to applicable law and limitations when retention is required for published content, legal claims, or verification records.</p>
<p>Email <a href="mailto:hello@troott.com">hello@troott.com</a> or see <a href="/legal/minister/gdpr">GDPR information</a>.</p>`,
        },
        {
            id: 'teams',
            navLabel: 'Teams',
            eyebrow: '14',
            title: 'Team members',
            body: `<p>When you invite collaborators, we process their email addresses and role assignments. You are responsible for informing team members about how Troott processes data and for managing permissions appropriately.</p>`,
        },
        {
            id: 'changes',
            navLabel: 'Changes',
            eyebrow: '15',
            title: 'Changes to this policy',
            body: `<p>We may update this Privacy Policy. Material changes will be communicated via Studio, email, or this page with an updated "Last updated" date.</p>`,
        },
        {
            id: 'contact',
            navLabel: 'Contact',
            eyebrow: '16',
            title: 'Contact us',
            body: `<p>Privacy questions: <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>
<p>Troott Technologies — <a href="https://troott.com">troott.com</a> · Studio: <a href="https://app.troott.com">app.troott.com</a></p>`,
        },
    ],
};

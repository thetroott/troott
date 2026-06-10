import type { LegalDocument } from '../types';

const LAST_UPDATED = 'March 2026';

export const ministerPrivacyPolicy: LegalDocument = {
    audience: 'minister',
    slug: 'privacy-policy',
    label: '// Legal · // Minister · Privacy Policy',
    heading: 'Privacy policy',
    headingMuted: `how we handle creator data · Last updated ${LAST_UPDATED}`,
    lastUpdated: '2026-03-01',
    sourceRefs: [
        'apps/api/src/models/core/minister.model.ts',
        'apps/web/src/services/observability/ObservabilityUserSync.tsx',
    ],
    sections: [
        {
            id: 'overview',
            navLabel: 'Overview',
            eyebrow: '1',
            title: 'Overview',
            body: `<p>This Privacy Policy describes how Troott processes personal data when you use Troott Studio as a minister or creator.</p>
<p>Contact: <a href="mailto:hello@troott.com">hello@troott.com</a></p>`,
        },
        {
            id: 'data-we-collect',
            navLabel: 'Data we collect',
            eyebrow: '2',
            title: 'Data we collect',
            body: `<p><strong>Account:</strong> name, email, phone, profile media, login history, and role assignments.</p>
<p><strong>Ministry profile:</strong> ministerial name, ministry name, logo, type, headquarters address, contact details, website, social links, and languages.</p>
<p><strong>Content:</strong> uploaded audio, thumbnails, titles, descriptions, tags, and publishing metadata.</p>
<p><strong>Analytics:</strong> aggregated and per-sermon listener metrics made available to you in Studio dashboards.</p>
<p><strong>Team:</strong> invite records and permission assignments for collaborators.</p>`,
        },
        {
            id: 'identity-verification',
            navLabel: 'ID verification',
            eyebrow: '3',
            title: 'Identity verification documents',
            body: `<p>To verify ministers, we collect government-issued identification images (such as national ID, driver's licence, or passport) and related verification metadata. These are used solely to confirm identity and ministry eligibility, accessed by authorised administrators, and stored securely on AWS infrastructure.</p>
<p>We retain verification records as needed for fraud prevention, legal compliance, and dispute resolution. Retention periods may extend after account deactivation where required by law.</p>`,
        },
        {
            id: 'sermon-data',
            navLabel: 'Sermon data',
            eyebrow: '4',
            title: 'Sermon and analytics data',
            body: `<p>Uploaded sermons are processed for transcoding, streaming, and delivery. We generate playback analytics (for example listen counts and session metadata) to provide Studio insights. Shareable links may use time-limited tokens as configured in Studio.</p>`,
        },
        {
            id: 'sharing',
            navLabel: 'Sharing',
            eyebrow: '5',
            title: 'Sharing and processors',
            body: `<p>We use subprocessors including AWS (storage and CDN), MongoDB, Redis, Paystack, email providers (MailerSend, Zeptomail, SMTP), and in production Studio environments: PostHog, Sentry, and Reo for analytics and error monitoring. These tools may receive user identifiers and contact information necessary to operate the service.</p>`,
        },
        {
            id: 'retention',
            navLabel: 'Retention',
            eyebrow: '6',
            title: 'Retention',
            body: `<p>Published sermon media may remain available to listeners according to platform policies even if you deactivate your account, subject to takedown requests and legal requirements. Verification documents and billing records may be retained longer where required.</p>`,
        },
        {
            id: 'your-rights',
            navLabel: 'Your rights',
            eyebrow: '7',
            title: 'Your rights',
            body: `<p>See <a href="/legal/minister/gdpr">GDPR information</a> or email <a href="mailto:hello@troott.com">hello@troott.com</a> to exercise access, correction, deletion, or portability rights, subject to applicable law and content retention rules.</p>`,
        },
    ],
};

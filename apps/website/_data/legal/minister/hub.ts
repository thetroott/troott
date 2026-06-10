import type { LegalHubContent } from '../types';

export const ministerHub: LegalHubContent = {
    audience: 'minister',
    label: '// Legal · // Minister',
    heading: 'Legal documents',
    headingMuted: 'for ministers.',
    intro:
        'These documents apply to Troott Studio at app.troott.com — publishing sermons, managing your ministry profile, verification, analytics, and team access.',
    sections: [
        {
            id: 'overview',
            navLabel: 'Overview',
            title: 'What these documents cover',
            body: `<p>Troott Studio is the web portal for ministers and creators who upload sermons, manage series and playlists, view analytics, and collaborate with team members. These legal documents describe your rights and obligations when using Studio and related API services.</p>`,
        },
        {
            id: 'documents',
            navLabel: 'Documents',
            title: 'Available documents',
            body: `<ul>
<li><strong>Terms of Use</strong> — rules for publishing and managing content on Troott Studio.</li>
<li><strong>Privacy Policy</strong> — how we process minister account data, including identity verification.</li>
<li><strong>Cookie Policy</strong> — cookies used when you access Studio in a browser.</li>
<li><strong>GDPR</strong> — your data protection rights.</li>
</ul>
<p>Listeners who use the mobile app should read <a href="/legal/listener">listener legal documents</a>.</p>`,
        },
        {
            id: 'contact',
            navLabel: 'Contact',
            title: 'Questions',
            body: `<p>Email <a href="mailto:hello@troott.com">hello@troott.com</a> for legal or compliance questions about Studio.</p>`,
        },
    ],
};

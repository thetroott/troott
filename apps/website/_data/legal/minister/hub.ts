import type { LegalHubContent } from '../types';

const LAST_REVIEWED = 'June 2026';

export const ministerHub: LegalHubContent = {
    audience: 'minister',
    label: '// Legal · // Minister',
    heading: 'Legal documents',
    headingMuted: 'for ministers.',
    intro:
        'These documents apply to Troott Studio at app.troott.com — publishing sermons, managing your ministry profile, verification, analytics, and team access. Last reviewed: ' +
        LAST_REVIEWED +
        '.',
    sections: [
        {
            id: 'welcome',
            navLabel: 'Welcome',
            title: 'Welcome',
            body: `<p>Troott Studio is the web portal for ministers and creators who upload sermons, manage series, view analytics, and collaborate with team members. These legal documents describe your rights and obligations when using Studio and related API services.</p>
<p>Completing minister verification may require submitting government-issued identification — see our Privacy Policy for how we handle that data.</p>`,
        },
        {
            id: 'documents',
            navLabel: 'Documents',
            title: 'Available documents',
            body: `<ul>
<li><a href="/legal/minister/terms-of-use"><strong>Terms of Use</strong></a> — rules for publishing on Studio, content standards, published sermon retention, teams, and trust and safety.</li>
<li><a href="/legal/minister/privacy-policy"><strong>Privacy Policy</strong></a> — minister account data, identity verification, sermon processing, analytics, and retention.</li>
<li><a href="/legal/minister/cookies"><strong>Cookie Policy</strong></a> — cookies and storage when you access Studio in a browser.</li>
<li><a href="/legal/minister/gdpr"><strong>GDPR</strong></a> — data protection rights for UK and EEA ministers, including sensitive ID data.</li>
</ul>`,
        },
        {
            id: 'quick-links',
            navLabel: 'Quick links',
            title: 'Most requested',
            body: `<ul>
<li><a href="/legal/minister/privacy-policy#identity-verification">ID verification</a> — how we handle government ID</li>
<li><a href="/legal/minister/terms-of-use#published-sermons">Published sermon policy</a></li>
<li><a href="/legal/minister/terms-of-use#content-standards">Content standards</a></li>
<li><a href="mailto:hello@troott.com">hello@troott.com</a> — legal, copyright, and abuse reports</li>
</ul>`,
        },
        {
            id: 'related',
            navLabel: 'Related',
            title: 'Listening on Troott?',
            body: `<p>Listeners who use the mobile app should read <a href="/legal/listener">Listener legal documents</a>.</p>`,
        },
        {
            id: 'contact',
            navLabel: 'Contact',
            title: 'Questions',
            body: `<p>Email <a href="mailto:hello@troott.com">hello@troott.com</a> for legal or compliance questions about Studio.</p>`,
        },
    ],
};

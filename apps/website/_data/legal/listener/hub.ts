import type { LegalHubContent } from '../types';

const LAST_REVIEWED = 'June 2026';

export const listenerHub: LegalHubContent = {
    audience: 'listener',
    label: '// Legal · // Listener',
    heading: 'Legal documents',
    headingMuted: 'for listeners.',
    intro:
        'These documents apply to the Troott mobile app and listener account — streaming sermons, building your library, and personalising your experience. Last reviewed: ' +
        LAST_REVIEWED +
        '.',
    sections: [
        {
            id: 'welcome',
            navLabel: 'Welcome',
            title: 'Welcome',
            body: `<p>Troott helps you discover, stream, and organise Christian sermons and teachings. As a listener, you use the Troott mobile app and related services to create an account, follow ministers, save playlists, and listen to content published by third-party ministers.</p>
<p>This legal pack explains your rights and our responsibilities when you use the listener app.</p>`,
        },
        {
            id: 'documents',
            navLabel: 'Documents',
            title: 'Available documents',
            body: `<ul>
<li><a href="/legal/listener/terms-of-use"><strong>Terms of Use</strong></a> — rules for using the Troott listener app, subscriptions, content licence, trust and safety, and account deactivation.</li>
<li><a href="/legal/listener/privacy-policy"><strong>Privacy Policy</strong></a> — what personal data we collect, how we use it, who we share it with, and your privacy rights.</li>
<li><a href="/legal/listener/cookies"><strong>Cookie Policy</strong></a> — app secure storage, local cache, and website cookies when you visit troott.com.</li>
<li><a href="/legal/listener/gdpr"><strong>GDPR</strong></a> — data protection rights for UK and EEA residents.</li>
</ul>`,
        },
        {
            id: 'quick-links',
            navLabel: 'Quick links',
            title: 'Most requested',
            body: `<ul>
<li><a href="/legal/listener/privacy-policy">Privacy Policy</a></li>
<li><a href="/legal/listener/terms-of-use">Terms of Use</a></li>
<li><a href="mailto:hello@troott.com">hello@troott.com</a> — legal and privacy questions</li>
</ul>`,
        },
        {
            id: 'related',
            navLabel: 'Related',
            title: 'Publishing on Troott?',
            body: `<p>Ministers and creators who upload sermons through Troott Studio should read <a href="/legal/minister">Minister legal documents</a> at <a href="https://app.troott.com">app.troott.com</a>.</p>`,
        },
        {
            id: 'contact',
            navLabel: 'Contact',
            title: 'Questions',
            body: `<p>Email <a href="mailto:hello@troott.com">hello@troott.com</a> for questions about these documents.</p>`,
        },
    ],
};

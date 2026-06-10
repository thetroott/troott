import type { LegalHubContent } from '../types';

export const listenerHub: LegalHubContent = {
    audience: 'listener',
    label: '// Legal · // Listener',
    heading: 'Legal documents',
    headingMuted: 'for listeners.',
    intro:
        'These documents apply to the Troott mobile app and listener account — streaming sermons, building your library, and personalising your experience.',
    sections: [
        {
            id: 'overview',
            navLabel: 'Overview',
            title: 'What these documents cover',
            body: `<p>Troott helps you discover, stream, and organise Christian sermons and teachings. As a listener, you use the Troott mobile app (and related services at <a href="https://api.troott.com">api.troott.com</a>) to create an account, follow ministers, save playlists, and listen to content published by third-party ministers.</p>
<p>Choose a document from the navigation to read our Terms of Use, Privacy Policy, Cookie Policy, or GDPR information.</p>`,
        },
        {
            id: 'documents',
            navLabel: 'Documents',
            title: 'Available documents',
            body: `<ul>
<li><strong>Terms of Use</strong> — rules for using the Troott listener app and your account.</li>
<li><strong>Privacy Policy</strong> — what personal data we collect and how we use it.</li>
<li><strong>Cookie Policy</strong> — how cookies and similar technologies apply when you use Troott.</li>
<li><strong>GDPR</strong> — your data protection rights if you are in the UK or EEA.</li>
</ul>
<p>Ministers and creators who publish content use <a href="/legal/minister">Troott Studio legal documents</a> instead.</p>`,
        },
        {
            id: 'contact',
            navLabel: 'Contact',
            title: 'Questions',
            body: `<p>If you have questions about these documents, email us at <a href="mailto:hello@troott.com">hello@troott.com</a>.</p>`,
        },
    ],
};

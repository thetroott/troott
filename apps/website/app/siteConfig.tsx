import { getGetTroottBaseUrl, joinUrl, publicEnv } from '@/lib/public-env';

const { siteUrl, webAppUrl, requestDemoUrl } = publicEnv;

export const siteConfig = {
    name: 'Troott - The new mobile space for sermons and teachings',
    url: siteUrl,
    description:
        'Troott helps you stay rooted in God’s Word. You find, listen to teachings and sermsons and share with friends and family - no distractions, no interruptions.',
    image: siteUrl ? joinUrl(siteUrl, '/images/troott-og.png') : '',
    baseLinks: {
        home: '/',
        listeners: '/listener',
        ministers: '/minister',
        faqs: '#faqs',
        login: webAppUrl ? joinUrl(webAppUrl, '/login') : '',
        requestDemo: requestDemoUrl || '/minister',
        studio: webAppUrl,
        getTroott: getGetTroottBaseUrl(),
        listenersWeb: webAppUrl,
        imprint: '/',
        legal: '/legal',
        privacy: '/legal/listener/privacy-policy',
        terms: '/legal/listener/terms-of-use',
        cookies: '/legal/listener/cookies',
    },
};

export type siteConfig = typeof siteConfig;

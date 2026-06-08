export const siteConfig = {
    name: 'Troott - The new mobile space for sermons and teachings',
    url: 'https://troott.com',
    description:
        'Troott helps you stay rooted in God’s Word. You find, listen to teachings and sermsons and share with friends and family - no distractions, no interruptions.',
    image: 'https://www.troott.com/images/troott-og.png',
    baseLinks: {
        home: '/',
        listeners: '#listener',
        ministers: '#minister',
        faqs: '#faqs',
        login: 'https://app.troott.com/login',
        studio: 'https://app.troott.com',
        imprint: '/',
        privacy:
            '/https://troott.notion.site/Troott-Privacy-Policy-24bb2bbd63c7806382bcfffe3fe1a1bf',
        terms: '/',
    },
};

export type siteConfig = typeof siteConfig;

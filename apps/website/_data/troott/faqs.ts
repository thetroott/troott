export type FaqItem = {
    id: string;
    question: string;
    answer: string;
};

export type FaqsContent = {
    label: string;
    heading: string;
    headingMuted: string;
    items: FaqItem[];
};

export const faqsContent: FaqsContent = {
    label: '// FAQ',
    heading: 'Questions?',
    headingMuted: "We've got answers.",
    items: [
        {
            id: 'find-sermons',
            question:
                "I'm tired of searching for old sermons. How does Troott make this easier?",
            answer: 'This makes us stand out, we make it easy to find old sermons. We organise sermons by minister, date, topic, and series. You can also search and filter in seconds.',
        },
        {
            id: 'playlists',
            question:
                'Can I create playlists or save sermons I want to listen to later?',
            answer: 'Yes, with just one tap you can create playlists, bookmark sermons, and build a personal library of messages that feed your spirit. No more losing track of that teachings you love.',
        },
        {
            id: 'storage',
            question:
                'I have limited space on my phone. Will Troott fill it up with downloads?',
            answer: 'No downloads needed. Troott streams sermons without taking up your storage, so you can save space for other important things while always having your sermons ready to play.',
        },
        {
            id: 'ministers-limit',
            question: 'How many ministers can I follow or listen to on Troott?',
            answer: "There's no limit. You can follow and listen to as many ministers as you want. Troott gives you full access to all the ministers and messages that help you grow. No hidden restrictions.",
        },
        {
            id: 'minister-cost',
            question:
                "I'm a minister. What does it cost to share my sermons on Troott?",
            answer: 'Uploading your sermons is free. Troott exists to help you grow your reach and disciple more people.',
        },
    ],
};

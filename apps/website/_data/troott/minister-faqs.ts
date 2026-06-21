import type { FaqsContent } from './faqs';

export const ministerFaqsContent: FaqsContent = {
    label: '// FAQ',
    heading: 'Questions?',
    headingMuted: "We've got answers.",
    items: [
        {
            id: 'minister-cost',
            question:
                "I'm a minister. What does it cost to share my sermons on Troott?",
            answer:
                'Uploading your sermons is free. Troott exists to help you grow your reach and disciple more people.',
        },
        {
            id: 'how-upload',
            question: 'How do I upload a sermon?',
            answer:
                'Sign in to Troott Studio, upload your audio file, add your title and details, and publish. Troott processes the audio and makes it available to listeners on mobile and web.',
        },
        {
            id: 'piracy',
            question:
                'My sermons get shared without credit. How does Troott help?',
            answer:
                'Troott gives your ministry an official home. Listeners follow you, find your catalogue, and share links that point back to your profile — not a random repost.',
        },
        {
            id: 'who-listens',
            question: 'Who will hear my sermons?',
            answer:
                'People who already listen to faith-based audio — and listeners searching for ministers they trust. You grow by being findable, shareable, and consistent.',
        },
        {
            id: 'team',
            question: 'Can my ministry team help me upload?',
            answer:
                'Studio is built for ministry teams. You can manage your library together so uploading does not fall on one person every week.',
        },
        {
            id: 'listener-app',
            question: 'Do my listeners need a separate app?',
            answer:
                'Yes — listeners use the Troott mobile app to follow you, save sermons, and listen. You publish from Studio; they listen from the app.',
        },
    ],
};

'use client';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../Accordion';

const faqs = [
    {
        question:
            'I’m tired of searching for old sermons. How does Troott make this easier?',
        answer: 'This makes us stand out, we make it easy to find old sermons. We organise sermons by minister, date, topic, and series. You can also search and filter in seconds.',
    },
    {
        question:
            'Can I create playlists or save sermons I want to listen to later?',
        answer: 'Yes, with just one tap you can create playlists, bookmark sermons, and build a personal library of messages that feed your spirit. No more losing track of that teachings you love.',
    },
    {
        question:
            'I have limited space on my phone. Will Troott fill it up with downloads?',
        answer: 'No downloads needed. Troott streams sermons without taking up your storage, so you can save space for other important things while always having your sermons ready to play.',
    },
    {
        question: 'How many ministers can I follow or listen to on Troott?',
        answer: 'There’s no limit. You can follow and listen to as many ministers as you want. Troott gives you full access to all the ministers and messages that help you grow. No hidden restrictions.',
    },
    {
        question:
            'I’m a minister. What does it cost to share my sermons on Troott?',
        answer: 'Uploading your sermons is free. Troott exists to help you grow your reach and disciple more people.',
    },
];

export function Faqs() {
    return (
        <section
            id="faqs"
            className="mt-32 sm:mt-36"
            aria-labelledby="faq-title"
        >
            <div className="flex flex-col items-center justify-center text-4xl text-center  sm:text-left sm:items-start sm:text-6xl md:text-7xl  gap-10 px- max-w-4xl mx-auto">
                <div className="">
                    <h2
                        id="faq-title"
                        className="animate-slideUpAndFade inline-block bg-gradient-to-br from-gray-50 to-gray-300 bg-clip-text py-2 pr-2 text-left text-4xl font-bold tracking-tighter text-transparent sm:text-center sm:text-6xl md:text-7xl"
                    >
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-4 text-left text-lg leading-7 text-gray-400 sm:text-center">
                        Need help with something? Here are some of the most
                        common questions we get.
                    </p>
                </div>

                <div className="w-full rounded-md border border-neutral-900 p-6 text-left">
                    <Accordion type="multiple" className="mx-auto">
                        {faqs.map((item) => (
                            <AccordionItem
                                value={item.question}
                                key={item.question}
                                className="py-3  first:pb-3 first:pt-0"
                            >
                                <AccordionTrigger className="text-lg">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-lg text-gray-400">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}

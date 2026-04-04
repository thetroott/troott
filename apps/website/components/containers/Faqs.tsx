"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../Accordion"

const faqs = [
  {
    question:
      "I’m tired of searching for old sermons. How does Troott make this easier?",
    answer:
      "This makes us stand out, we make it easy to find old sermons. We organise sermons by preacher, date, topic, and series. You can also search and filter in seconds.",
  },
  {
    question: "Can I create playlists or save sermons I want to listen to later?",
    answer:
      "Yes, with just one tap you can create playlists, bookmark sermons, and build a personal library of messages that feed your spirit. No more losing track of that teachings you love.",
  },
  {
    question:
      "I have limited space on my phone. Will Troott fill it up with downloads?",
    answer:
      "No downloads needed. Troott streams sermons without taking up your storage, so you can save space for other important things while always having your sermons ready to play.",
  },
  {
    question:
      "How many preachers can I follow or listen to on Troott?",
    answer:
      "There’s no limit. You can follow and listen to as many preachers as you want. Troott gives you full access to all the ministers and messages that help you grow. No hidden restrictions.",
  },
  {
    question:
      "I’m a preacher. What does it cost to share my sermons on Troott?",
    answer:
      "Uploading your sermons is free. Troott exists to help you grow your reach and disciple more people.",
  },
]

export function Faqs() {
  return (
    <section id="faqs" className="mt-32 sm:mt-36" aria-labelledby="faq-title">
      <div className="flex flex-col items-center justify-center text-4xl text-center  sm:text-left sm:items-start sm:text-6xl md:text-7xl  gap-10 px- max-w-4xl mx-auto">
        
        <div className="">
          <h2
            id="faq-title"
            className="inline-block text-left sm:text-center animate-slideUpAndFade bg-gradient-to-br from-gray-900 to-gray-800 bg-clip-text py-2 pr-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-7xl  dark:from-gray-50 dark:to-gray-300"
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-left sm:text-center text-lg leading-7 text-gray-600 dark:text-gray-400">
          Need help with something? Here are some of the most common questions we get.
          </p>
        </div>

        <div className="border p-6 border-gray-300 dark:border-neutral-900 rounded-md w-full text-left">
          <Accordion type="multiple" className="mx-auto">
            {faqs.map((item) => (
              <AccordionItem
                value={item.question}
                key={item.question}
                className="py-3  first:pb-3 first:pt-0"
              >
                <AccordionTrigger className="text-lg">{item.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400 text-lg">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
      </div>
    </section>
  )
}

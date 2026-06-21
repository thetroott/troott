'use client';

import ThemedImage from '../containers/ThemedImage';

export default function HeroImage() {
    return (
        <section aria-label="Hero Image of the website" className="flow-root">
            <div className="">
                <ThemedImage
                    src="/images/hero-listener.png"
                    alt="A preview of troott"
                    width={2400}
                    height={1600}
                    className="rounded-xl "
                />
            </div>
        </section>
    );
}

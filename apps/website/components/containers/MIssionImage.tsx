'use client';

import ThemedImage from './ThemedImage';

export default function MissionImage() {
    return (
        <section aria-label="Hero Image of the website" className="flow-root">
            <div className="rounded-2xl bg-neutral-900/70 p-2 ring-1 ring-inset ring-white/10">
                <div className="rounded-xl bg-slate-950 ring-1 ring-white/15">
                    <ThemedImage
                        src="/images/hero-mockup.png"
                        alt="A preview of troott"
                        width={2400}
                        height={1600}
                        className="rounded-xl shadow-2xl shadow-indigo-600/10"
                    />
                </div>
            </div>
        </section>
    );
}

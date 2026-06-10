import { benefitsContent } from '@/_data/troott/benefits';
import { cx } from '@/lib/utils';

export function BenefitsSection() {
    const { id, label, heading, headingMuted, items } = benefitsContent;

    return (
        <section
            id={id}
            aria-labelledby={`${id}-heading`}
            className="bg-background py-20 sm:py-28"
        >
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <header className="mb-12 lg:mb-16">
                    <p className="font-mono text-[13px] leading-none text-zinc-500">
                        {label}
                    </p>
                    <h2
                        id={`${id}-heading`}
                        className="mt-5 font-matter-semibold text-[2.25rem] leading-[1.05] tracking-[-0.03em] text-white lg:text-[2.75rem]"
                    >
                        <span className="block">{heading}</span>
                        <span className="block text-zinc-500">{headingMuted}</span>
                    </h2>
                </header>

                <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                    {items.map((item) => {
                        const Icon = item.icon;

                        return (
                            <li
                                key={item.id}
                                className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#111111] p-6"
                            >
                                <span
                                    className={cx(
                                        'inline-flex size-10 items-center justify-center',
                                        'rounded-lg bg-[#262626] text-white',
                                    )}
                                    aria-hidden="true"
                                >
                                    <Icon className="size-5" />
                                </span>
                                <div>
                                    <h3 className="font-matter text-base font-medium text-white">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 font-matter text-[15px] leading-[1.65] text-zinc-400 sm:text-base sm:leading-[1.7]">
                                        {item.description}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

import type { ReactNode } from 'react';

type SettingsSectionCardProps = {
    title: string;
    description: string;
    children: ReactNode;
};

export function SettingsSectionCard({
    title,
    description,
    children,
}: SettingsSectionCardProps) {
    return (
        <section className="rounded-xl border border-[#545454] bg-[#2b2a2c] p-6">
            <header className="mb-6 space-y-1">
                <h2 className="text-lg font-semibold text-[#eaeaea]">{title}</h2>
                <p className="text-sm leading-5 text-[#bdbdbd]">{description}</p>
            </header>
            {children}
        </section>
    );
}

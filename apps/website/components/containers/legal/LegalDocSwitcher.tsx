import { RiArticleLine } from '@remixicon/react';

import { getLegalDocIcon, getLegalDocNav } from '@/_data/legal/documents';
import type { LegalAudience, LegalDocSlug } from '@/_data/legal/types';
import { ScrollspyNavRow } from '@/components/shared/scrollspy';

type LegalDocSwitcherProps = {
    audience: LegalAudience;
    currentSlug?: LegalDocSlug;
};

export function LegalDocSwitcher({
    audience,
    currentSlug,
}: LegalDocSwitcherProps) {
    const items = getLegalDocNav(audience);

    return (
        <ul className="flex flex-col">
            {items.map((item) => (
                <ScrollspyNavRow
                    key={item.slug}
                    href={item.href}
                    label={item.navLabel}
                    icon={getLegalDocIcon(item.slug)}
                    isActive={item.slug === currentSlug}
                    isRoute
                    uppercase={false}
                />
            ))}
        </ul>
    );
}

type LegalSectionNavProps = {
    sections: { id: string; navLabel: string }[];
    activeSectionId: string;
    onNavigate: (sectionId: string) => void;
    domIdForSection: (id: string) => string;
};

export function LegalSectionNav({
    sections,
    activeSectionId,
    onNavigate,
    domIdForSection,
}: LegalSectionNavProps) {
    return (
        <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                In this document
            </p>
            <ul className="flex flex-col">
                {sections.map((section) => (
                    <ScrollspyNavRow
                        key={section.id}
                        href={`#${domIdForSection(section.id)}`}
                        label={section.navLabel}
                        icon={RiArticleLine}
                        isActive={section.id === activeSectionId}
                        uppercase={false}
                        onClick={(event) => {
                            event.preventDefault();
                            onNavigate(section.id);
                        }}
                    />
                ))}
            </ul>
        </div>
    );
}

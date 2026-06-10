export type LegalAudience = 'listener' | 'minister';

export type LegalDocSlug =
    | 'terms-of-use'
    | 'privacy-policy'
    | 'cookies'
    | 'gdpr';

export type LegalSection = {
    id: string;
    navLabel: string;
    eyebrow?: string;
    title: string;
    body: string;
};

export type LegalDocument = {
    audience: LegalAudience;
    slug: LegalDocSlug;
    label: string;
    heading: string;
    headingMuted: string;
    lastUpdated: string;
    sections: LegalSection[];
    sourceRefs?: string[];
};

export type LegalHubContent = {
    audience: LegalAudience;
    label: string;
    heading: string;
    headingMuted: string;
    intro: string;
    sections: LegalSection[];
};

export type LegalDocNavItem = {
    slug: LegalDocSlug;
    navLabel: string;
    href: string;
};

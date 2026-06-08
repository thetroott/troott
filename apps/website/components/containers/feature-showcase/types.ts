export type FeatureShowcaseCta = {
    label: string;
    href: string;
    external?: boolean;
};

export type FeatureShowcaseImage = {
    src: string;
    alt: string;
};

export type FeatureShowcaseItem = {
    title: string;
    description: string;
    cta: FeatureShowcaseCta;
    image: FeatureShowcaseImage;
    /** Text left, image right when true. Image left, text right when false. */
    reversed?: boolean;
    /** Subtle gold gradient line along the top edge of the card. */
    accentTop?: boolean;
};

export type CoreFeaturesSectionProps = {
    label?: string;
    heading: string;
    headingMuted: string;
    items: FeatureShowcaseItem[];
};

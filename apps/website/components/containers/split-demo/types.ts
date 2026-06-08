export type SplitDemoCta = {
    label: string;
    href: string;
    external?: boolean;
};

export type SplitDemoImage = {
    src: string;
    alt: string;
};

export type SplitDemoSectionProps = {
    label?: string;
    heading: string;
    description: string;
    cta: SplitDemoCta;
    image: SplitDemoImage;
    /** Text left, image right when false. Swapped when true. */
    reversed?: boolean;
};

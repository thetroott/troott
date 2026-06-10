export type LogoCloudItem = {
    src: `/blocks/${string}`;
    alt: string;
    invertOnDark?: boolean;
};

export type LogoCloudContent = {
    id: 'partners';
    label: string;
    logos: readonly LogoCloudItem[];
};

export const logoCloudContent: LogoCloudContent = {
    id: 'partners',
    label: 'Built with the tools we trust, from idea to production.',
    logos: [
        { src: '/blocks/typescript.svg', alt: 'TypeScript' },
        { src: '/blocks/go.png', alt: 'Go' },
        { src: '/blocks/rust.png', alt: 'Rust' },
        { src: '/blocks/node-js.svg', alt: 'Node.js' },
        { src: '/blocks/react.svg', alt: 'React' },
        { src: '/blocks/tailwind-css.svg', alt: 'Tailwind CSS' },
        { src: '/blocks/canva.svg', alt: 'Canva' },
        { src: '/blocks/figma.svg', alt: 'Figma' },
        { src: '/blocks/notion.svg', alt: 'Notion' },
        { src: '/blocks/mongodb.svg', alt: 'MongoDB' },
        { src: '/blocks/express-js.svg', alt: 'Express' },
    ],
} as const;

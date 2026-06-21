import type { RemixiconComponentType } from '@remixicon/react';
import {
    RiBookmarkLine,
    RiCompass3Line,
    RiHeadphoneLine,
    RiPlayListAddLine,
    RiShareForwardLine,
    RiTimeLine,
} from '@remixicon/react';

export type ShowcasePhotoTile = {
    id: string;
    kind: 'photo';
    src: string;
    alt: string;
};

export type ShowcaseActionTile = {
    id: string;
    kind: 'action';
    icon: RemixiconComponentType;
    label: string;
};

export type ShowcaseTile = ShowcasePhotoTile | ShowcaseActionTile;

export type AppShowcaseContent = {
    id: 'app-showcase';
    phone: { src: string; alt: string; width: 272 };
    rows: [
        { id: 'top'; tiles: ShowcaseTile[] },
        { id: 'bottom'; tiles: ShowcaseTile[] },
    ];
};

const topRowTiles: ShowcaseTile[] = [
    {
        id: 'photo-joshua',
        kind: 'photo',
        src: '/images/apst-joshua-selman-.jpg',
        alt: 'Apostle Joshua Selman',
    },
    {
        id: 'listen',
        kind: 'action',
        icon: RiHeadphoneLine,
        label: 'Listen anywhere',
    },
    {
        id: 'photo-tolu',
        kind: 'photo',
        src: '/images/apst-tolu-agboola.jpg',
        alt: 'Apostle Tolu Agboola',
    },
    {
        id: 'save',
        kind: 'action',
        icon: RiBookmarkLine,
        label: 'Save sermons',
    },
    {
        id: 'photo-arome',
        kind: 'photo',
        src: '/images/apst-arome-osayi.jpg',
        alt: 'Apostle Arome Osayi',
    },
    {
        id: 'share',
        kind: 'action',
        icon: RiShareForwardLine,
        label: 'Share a message',
    },
];

const bottomRowTiles: ShowcaseTile[] = [
    {
        id: 'photo-felix',
        kind: 'photo',
        src: '/images/rev-felix-adejumo.jpg',
        alt: 'Rev Funke Felix Adejumo',
    },
    {
        id: 'playlist',
        kind: 'action',
        icon: RiPlayListAddLine,
        label: 'Build playlists',
    },
    {
        id: 'photo-jd',
        kind: 'photo',
        src: '/images/apostle-jd.jpg',
        alt: 'Apostle Jesudamilare Adesegun-David',
    },
    {
        id: 'resume',
        kind: 'action',
        icon: RiTimeLine,
        label: 'Pick up where you left off',
    },
    {
        id: 'photo-abenezer',
        kind: 'photo',
        src: '/images/abenezer-shewaga.jpg',
        alt: 'Abenezer Shewaga',
    },
    {
        id: 'discover',
        kind: 'action',
        icon: RiCompass3Line,
        label: 'Discover ministers',
    },
];

export const appShowcaseContent: AppShowcaseContent = {
    id: 'app-showcase',
    phone: {
        src: '/blocks/phone-screenshot-appstore.png',
        alt: 'Troott app library on iPhone',
        width: 272,
    },
    rows: [
        { id: 'top', tiles: topRowTiles },
        { id: 'bottom', tiles: bottomRowTiles },
    ],
};

import {
    RiCookieLine,
    RiDatabase2Line,
    RiFileTextLine,
    RiShieldUserLine,
} from '@remixicon/react';
import type { RemixiconComponentType } from '@remixicon/react';

import { listenerCookies } from './listener/cookies';
import { listenerGdpr } from './listener/gdpr';
import { listenerHub } from './listener/hub';
import { listenerPrivacyPolicy } from './listener/privacy-policy';
import { listenerTermsOfUse } from './listener/terms-of-use';
import { ministerCookies } from './minister/cookies';
import { ministerGdpr } from './minister/gdpr';
import { ministerHub } from './minister/hub';
import { ministerPrivacyPolicy } from './minister/privacy-policy';
import { ministerTermsOfUse } from './minister/terms-of-use';
import type {
    LegalAudience,
    LegalDocNavItem,
    LegalDocSlug,
    LegalDocument,
    LegalHubContent,
} from './types';

export const LEGAL_DOC_SLUGS: LegalDocSlug[] = [
    'terms-of-use',
    'privacy-policy',
    'cookies',
    'gdpr',
];

const DOC_ICONS: Record<LegalDocSlug, RemixiconComponentType> = {
    'terms-of-use': RiFileTextLine,
    'privacy-policy': RiShieldUserLine,
    cookies: RiCookieLine,
    gdpr: RiDatabase2Line,
};

const DOC_LABELS: Record<LegalDocSlug, string> = {
    'terms-of-use': 'Terms of Use',
    'privacy-policy': 'Privacy Policy',
    cookies: 'Cookies',
    gdpr: 'GDPR',
};

const documentsByAudience: Record<
    LegalAudience,
    Record<LegalDocSlug, LegalDocument>
> = {
    listener: {
        'terms-of-use': listenerTermsOfUse,
        'privacy-policy': listenerPrivacyPolicy,
        cookies: listenerCookies,
        gdpr: listenerGdpr,
    },
    minister: {
        'terms-of-use': ministerTermsOfUse,
        'privacy-policy': ministerPrivacyPolicy,
        cookies: ministerCookies,
        gdpr: ministerGdpr,
    },
};

const hubsByAudience: Record<LegalAudience, LegalHubContent> = {
    listener: listenerHub,
    minister: ministerHub,
};

export function getLegalHub(audience: LegalAudience): LegalHubContent {
    return hubsByAudience[audience];
}

export function getLegalDocument(
    audience: LegalAudience,
    slug: LegalDocSlug,
): LegalDocument {
    return documentsByAudience[audience][slug];
}

export function getLegalDocNav(audience: LegalAudience): LegalDocNavItem[] {
    return LEGAL_DOC_SLUGS.map((slug) => ({
        slug,
        navLabel: DOC_LABELS[slug],
        href: `/legal/${audience}/${slug}`,
    }));
}

export function getLegalDocIcon(slug: LegalDocSlug): RemixiconComponentType {
    return DOC_ICONS[slug];
}

export function isLegalDocSlug(value: string): value is LegalDocSlug {
    return (LEGAL_DOC_SLUGS as string[]).includes(value);
}

export function isLegalAudience(value: string): value is LegalAudience {
    return value === 'listener' || value === 'minister';
}

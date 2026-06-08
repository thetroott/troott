import { siteConfig } from '@/app/siteConfig';
import type { LucideIcon } from 'lucide-react';
import {
    Building2,
    Headphones,
    HelpCircle,
    Library,
    Linkedin,
    Mail,
    Mic,
    Monitor,
    PlayCircle,
    Share2,
    Smartphone,
    Users,
    X,
} from 'lucide-react';

import type { NavIconVariant } from '@/components/containers/navbar/NavDropdownIcon';

export type NavDropdownItem = {
    title: string;
    description: string;
    href: string;
    external?: boolean;
    icon?: LucideIcon;
    iconVariant?: NavIconVariant;
};

export type NavSection = {
    label: string;
    items: NavDropdownItem[];
};

export type NavItem =
    | {
          label: string;
          href: string;
          dropdownItems?: never;
          sections?: never;
      }
    | {
          label: string;
          href?: never;
          dropdownItems: NavDropdownItem[];
          sections?: never;
      }
    | {
          label: string;
          href?: never;
          dropdownItems?: never;
          sections: NavSection[];
      };

export const NavigationItems: NavItem[] = [
    {
        label: 'Product',
        dropdownItems: [
            {
                title: 'Troott Mobile',
                description: 'Listen to sermons on iOS and Android',
                href: siteConfig.baseLinks.listeners,
                icon: Smartphone,
                iconVariant: 'neutral',
            },
            {
                title: 'Troott Studio',
                description: 'Upload and manage sermons for your ministry',
                href: siteConfig.baseLinks.studio,
                external: true,
                icon: Monitor,
                iconVariant: 'brand',
            },
            {
                title: 'For listeners',
                description: 'Discover, save, and share teachings',
                href: siteConfig.baseLinks.listeners,
                icon: PlayCircle,
                iconVariant: 'brand-filled',
            },
        ],
    },
    {
        label: 'Solutions',
        sections: [
            {
                label: 'USE CASES',
                items: [
                    {
                        title: 'Personal devotion',
                        description: 'Build a daily listening habit',
                        href: siteConfig.baseLinks.listeners,
                        icon: Headphones,
                        iconVariant: 'neutral',
                    },
                    {
                        title: 'Small groups',
                        description: 'Share teachings with your group',
                        href: siteConfig.baseLinks.listeners,
                        icon: Users,
                        iconVariant: 'neutral',
                    },
                    {
                        title: 'Church library',
                        description:
                            'One place for your congregation’s sermons',
                        href: siteConfig.baseLinks.ministers,
                        icon: Library,
                        iconVariant: 'brand',
                    },
                    {
                        title: 'Share with family',
                        description: 'Send messages to friends and family',
                        href: siteConfig.baseLinks.listeners,
                        icon: Share2,
                        iconVariant: 'neutral',
                    },
                ],
            },
            {
                label: 'AUDIENCE',
                items: [
                    {
                        title: 'Ministers & preachers',
                        description: 'Upload and reach listeners worldwide',
                        href: siteConfig.baseLinks.ministers,
                        icon: Mic,
                        iconVariant: 'brand-filled',
                    },
                    {
                        title: 'Listeners',
                        description: 'Find your favourite ministers',
                        href: siteConfig.baseLinks.listeners,
                        icon: PlayCircle,
                        iconVariant: 'brand',
                    },
                    {
                        title: 'Churches & ministries',
                        description: 'Scale sermon distribution',
                        href: siteConfig.baseLinks.ministers,
                        icon: Building2,
                        iconVariant: 'brand-filled',
                    },
                ],
            },
        ],
    },
    {
        label: 'Resources',
        dropdownItems: [
            {
                title: 'FAQs',
                description: 'Common questions about Troott',
                href: siteConfig.baseLinks.faqs,
                icon: HelpCircle,
                iconVariant: 'neutral',
            },
            {
                title: 'Contact',
                description: 'Email the team',
                href: 'mailto:hello@troott.com',
                icon: Mail,
                iconVariant: 'neutral',
            },
            {
                title: 'X (Twitter)',
                description: 'Follow @thetroott',
                href: 'https://x.com/thetroott',
                external: true,
                icon: X,
                iconVariant: 'neutral',
            },
            {
                title: 'LinkedIn',
                description: 'Company updates',
                href: 'https://www.linkedin.com/company/troott',
                external: true,
                icon: Linkedin,
                iconVariant: 'brand',
            },
        ],
    },
    {
        label: 'FAQs',
        href: siteConfig.baseLinks.faqs,
    },
];

export function getMobileDropdownItems(item: NavItem): NavDropdownItem[] {
    if ('dropdownItems' in item && item.dropdownItems) {
        return item.dropdownItems;
    }
    if ('sections' in item && item.sections) {
        return item.sections.flatMap((section) => section.items);
    }
    return [];
}

import { RiArrowRightUpLine } from '@remixicon/react';
import Link from 'next/link';

import { siteConfig } from '@/app/siteConfig';
import { TroottLogo } from '@/public/TroottLogo';

const navigation = {
    product: [
        { name: 'Ministers', href: siteConfig.baseLinks.ministers, external: false },
        { name: 'Listeners', href: siteConfig.baseLinks.listeners, external: false },
        { name: 'faqs', href: '#faqs', external: false },
    ],
    resources: [
        {
            name: 'X (Twitter)',
            href: 'https://x.com/thetroott',
            external: true,
        },
        {
            name: 'LinkedIn',
            href: 'https://www.linkedin.com/company/troott',
            external: true,
        },
    ],
    company: [
        { name: 'About', href: '#', external: false },
        { name: 'Contact', href: 'mailto:hello@troott.com', external: false },
    ],
    legal: [
        { name: 'Legal', href: siteConfig.baseLinks.legal, external: false },
        { name: 'Privacy', href: siteConfig.baseLinks.privacy, external: false },
        { name: 'Terms', href: siteConfig.baseLinks.terms, external: false },
        { name: 'Cookies', href: siteConfig.baseLinks.cookies, external: false },
    ],
};

export default function Footer() {
    return (
        <footer id="footer" className="bg-stone-900">
            <div className="mx-auto max-w-7xl px-6 pb-8 pt-16">
                <div className="xl:grid xl:grid-cols-3 xl:gap-20">
                    <div className="space-y-8">
                        <TroottLogo className="w-32 sm:w-40" />
                        <p className="text-lgleading-6 text-gray-400">
                            Turning audio sermons into a tool for true
                            discipleship. Made with ❤️ in Nigeria, crafted for
                            the world.
                        </p>
                    </div>
                    <div className="mt-16 pb-40 grid grid-cols-1 gap-14 sm:gap-8 md:grid-cols-2 xl:col-span-2 xl:mt-0">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-gray-50">
                                    Product
                                </h3>
                                <ul
                                    role="list"
                                    className="mt-6 space-y-4"
                                    aria-label="Quick links Product"
                                >
                                    {navigation.product.map((item) => (
                                        <li key={item.name} className="w-fit">
                                            <Link
                                                className="flex rounded-md text-sm text-gray-400 hover:text-gray-50"
                                                href={item.href}
                                                target={
                                                    item.external
                                                        ? '_blank'
                                                        : undefined
                                                }
                                                rel={
                                                    item.external
                                                        ? 'noopener noreferrer'
                                                        : undefined
                                                }
                                            >
                                                <span>{item.name}</span>
                                                {item.external && (
                                                    <div className="ml-1 aspect-square size-3 rounded-full bg-gray-500/20">
                                                        <RiArrowRightUpLine
                                                            aria-hidden="true"
                                                            className="size-full shrink-0 text-gray-300"
                                                        />
                                                    </div>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-gray-50">
                                    Resources
                                </h3>
                                <ul
                                    role="list"
                                    className="mt-6 space-y-4"
                                    aria-label="Quick links Resources"
                                >
                                    {navigation.resources.map((item) => (
                                        <li key={item.name} className="w-fit">
                                            <Link
                                                className="flex rounded-md text-sm text-gray-400 hover:text-gray-50"
                                                href={item.href}
                                                target={
                                                    item.external
                                                        ? '_blank'
                                                        : undefined
                                                }
                                                rel={
                                                    item.external
                                                        ? 'noopener noreferrer'
                                                        : undefined
                                                }
                                            >
                                                <span>{item.name}</span>
                                                {item.external && (
                                                    <div className="ml-0.5 aspect-square size-3 rounded-full bg-gray-500/20">
                                                        <RiArrowRightUpLine
                                                            aria-hidden="true"
                                                            className="size-full shrink-0 text-gray-300"
                                                        />
                                                    </div>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-gray-50">
                                    Company
                                </h3>
                                <ul
                                    role="list"
                                    className="mt-6 space-y-4"
                                    aria-label="Quick links Company"
                                >
                                    {navigation.company.map((item) => (
                                        <li key={item.name} className="w-fit">
                                            <Link
                                                className="flex rounded-md text-sm text-gray-400 hover:text-gray-50"
                                                href={item.href}
                                                target={
                                                    item.external
                                                        ? '_blank'
                                                        : undefined
                                                }
                                                rel={
                                                    item.external
                                                        ? 'noopener noreferrer'
                                                        : undefined
                                                }
                                            >
                                                <span>{item.name}</span>
                                                {item.external && (
                                                    <div className="ml-1 aspect-square size-3 rounded-full bg-gray-500/20">
                                                        <RiArrowRightUpLine
                                                            aria-hidden="true"
                                                            className="size-full shrink-0 text-gray-300"
                                                        />
                                                    </div>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-gray-50">
                                    Legal
                                </h3>
                                <ul
                                    role="list"
                                    className="mt-6 space-y-4"
                                    aria-label="Quick links Legal"
                                >
                                    {navigation.legal.map((item) => (
                                        <li key={item.name} className="w-fit">
                                            <Link
                                                className="flex rounded-md text-sm text-gray-400 hover:text-gray-50"
                                                href={item.href}
                                                target={
                                                    item.external
                                                        ? '_blank'
                                                        : undefined
                                                }
                                                rel={
                                                    item.external
                                                        ? 'noopener noreferrer'
                                                        : undefined
                                                }
                                            >
                                                <span>{item.name}</span>
                                                {item.external && (
                                                    <div className="ml-1 aspect-square size-3 rounded-full bg-gray-500/20">
                                                        <RiArrowRightUpLine
                                                            aria-hidden="true"
                                                            className="size-full shrink-0 text-gray-300"
                                                        />
                                                    </div>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-16  flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:mt-20 sm:flex-row lg:mt-34">
                    <p className="text-sm leading-5 text-gray-400">
                        All rights reserved
                        &copy; {new Date().getFullYear()} Troott
                       
                    </p>
                    <Link
                        href="https://status.troott.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-gray-800 py-1 pl-1 pr-2 transition-colors hover:border-gray-700 hover:bg-gray-900/50"
                        aria-label="System status — opens status.troott.com"
                    >
                        <div className="flex items-center gap-1.5">
                            <div className="relative size-4 shrink-0">
                                <div className="absolute inset-[1px] rounded-full bg-emerald-600/20" />
                                <div className="absolute inset-1 rounded-full bg-emerald-500" />
                            </div>
                            <span className="text-xs text-gray-50">
                                All Systems Operational
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
        </footer>
    );
}

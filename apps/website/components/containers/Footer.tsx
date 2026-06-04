import { RiArrowRightUpLine } from '@remixicon/react';
import Link from 'next/link';
import { TroottLogo } from '@/public/TroottLogo';

const navigation = {
    product: [
        { name: 'Ministers', href: '#minister', external: false },
        { name: 'Listeners', href: '#listener', external: false },
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
        {
            name: 'Privacy',
            href: 'https://troott.notion.site/Troott-Privacy-Policy-24bb2bbd63c7806382bcfffe3fe1a1bf',
            external: true,
        },
        { name: 'Terms', href: '#', external: false },
    ],
};

export default function Footer() {
    return (
        <footer id="footer">
            <div className="mx-auto max-w-6xl px-3 pb-8 pt-16 sm:pt-24 lg:pt-32">
                <div className="xl:grid xl:grid-cols-3 xl:gap-20">
                    <div className="space-y-8">
                        <TroottLogo className="w-32 sm:w-40" />
                        <p className="text-sm leading-6 text-gray-400">
                            Turning audio sermons into a tool for true
                            discipleship. Made with ❤️ in Nigeria, crafted for
                            the world.
                        </p>
                    </div>
                    <div className="mt-16 grid grid-cols-1 gap-14 sm:gap-8 md:grid-cols-2 xl:col-span-2 xl:mt-0">
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
                <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:mt-20 sm:flex-row lg:mt-24">
                    <p className="text-sm leading-5 text-gray-400">
                        &copy; {new Date().getFullYear()} Troott Technologies.
                        All rights reserved.
                    </p>
                    <div className="rounded-full border border-gray-800 py-1 pl-1 pr-2">
                        <div className="flex items-center gap-1.5">
                            <div className="relative size-4 shrink-0">
                                <div className="absolute inset-[1px] rounded-full bg-emerald-600/20" />
                                <div className="absolute inset-1 rounded-full bg-emerald-500" />
                            </div>
                            <span className="text-xs text-gray-50">
                                private alpha
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

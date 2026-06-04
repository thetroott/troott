import { RiArrowRightLine } from '@remixicon/react';
import Link from 'next/link';

function MobileLink({
    href,
    children,
    onClick,
}: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="group flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 ease-in-out hover:bg-teal-900/20"
        >
            <span className="text-base font-medium text-gray-100">
                {children}
            </span>

            <span
                className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-teal-600 transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:bg-background"
            >
                <RiArrowRightLine
                    className="size-5 text-teal-300 transition-transform duration-300 ease-in-out group-hover:rotate-[-45deg] group-hover:text-white"
                />
            </span>
        </Link>
    );
}

export default MobileLink;

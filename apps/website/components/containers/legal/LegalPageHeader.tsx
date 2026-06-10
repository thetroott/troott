import { cx } from '@/lib/utils';

type LegalPageHeaderProps = {
    heading: string;
    headingMuted: string;
    as?: 'h1' | 'h2';
    className?: string;
};

export function LegalPageHeader({
    heading,
    headingMuted,
    as: Tag = 'h1',
    className,
}: LegalPageHeaderProps) {
    return (
        <Tag
            className={cx(
                'text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.5rem]',
                className,
            )}
        >
            <span className="block">{heading}</span>
            <span className="block text-zinc-500">{headingMuted}</span>
        </Tag>
    );
}

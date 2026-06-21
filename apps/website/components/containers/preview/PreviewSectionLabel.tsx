import { cx } from '@/lib/utils';

type PreviewSectionLabelProps = {
    name: string;
    className?: string;
};

export function PreviewSectionLabel({ name, className }: PreviewSectionLabelProps) {
    return (
        <div
            className={cx(
                'border-y border-dashed border-teal-400/30 bg-teal-950/20 px-4 py-2',
                className,
            )}
        >
            <p className="container mx-auto max-w-7xl font-mono text-xs uppercase tracking-[0.12em] text-teal-400">
                {name}
            </p>
        </div>
    );
}

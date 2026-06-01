interface AnalyticsTabPlaceholderProps {
    message: string;
}

export default function AnalyticsTabPlaceholder({
    message,
}: AnalyticsTabPlaceholderProps) {
    return (
        <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-[#545454]/50 bg-[#2b2a2c] p-8">
            <p className="text-sm text-[#bdbdbd]">{message}</p>
        </div>
    );
}

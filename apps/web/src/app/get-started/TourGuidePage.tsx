import PageHeader from '@/components/shared/get-started/PageHeader';

/**
 * Placeholder tour screen; Continue runs `tour-complete` via {@link ProgressButtons}.
 */
export default function TourGuidePage() {
    return (
        <div className="max-w-3xl">
            <PageHeader
                title="How to use Troott"
                description="Explore the dashboard at your own pace. When you are ready, press Continue to move on to uploading your first sermon."
            />
            <p className="text-sm text-muted-foreground mt-4">
                A full interactive tour can be added here later.
            </p>
        </div>
    );
}

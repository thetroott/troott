import React from 'react';
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react';

export interface FeedSectionProps {
    hasSermons?: boolean;
}

const FeedSection: React.FC<FeedSectionProps> = ({ hasSermons = false }) => {
    return (
        <div className="space-y-6">
            {/* Your feeds section */}
            <div className="bg-card rounded-xl border border-border/50 p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                    Your feeds
                </h3>

                {hasSermons ? (
                    <div className="py-10 px-4 text-center border border-dashed border-border/40 rounded-xl bg-muted/10">
                        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                            Activity from your published and in-progress sermons
                            will show here as the studio feed is connected. Use{' '}
                            <span className="text-foreground font-medium">
                                Upload
                            </span>{' '}
                            above to add another sermon.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <img
                            src="/images/assets/no-activity.svg"
                            alt="Empty State"
                            className="w-20 h-20"
                        />

                        <h4 className="text-base font-medium text-foreground mb-2">
                            No activity yet
                        </h4>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Start by uploading your first message or teaching to
                            get things moving.
                        </p>
                    </div>
                )}
            </div>

            {/* Your content stats section */}
            <div className="bg-card rounded-xl border border-border/50 p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                    Your content stats
                </h3>

                {/* Stats flex */}
                <div className="flex flex-wrap justify-center gap-4">
                    <div className="bg-muted/50 rounded-lg p-4 text-center flex-1 min-w-[150px] max-w-[200px]">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg mx-auto mb-2">
                            <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            0
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Total Sermons
                        </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 text-center flex-1 min-w-[150px] max-w-[200px]">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto mb-2">
                            <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            0
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Total Views
                        </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 text-center flex-1 min-w-[150px] max-w-[200px]">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto mb-2">
                            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            0
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Subscribers
                        </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 text-center flex-1 min-w-[150px] max-w-[200px]">
                        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg mx-auto mb-2">
                            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            0%
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Growth Rate
                        </div>
                    </div>
                </div>

                {/* Additional stats */}
                <div className="mt-6 pt-4 border-t border-border/50">
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <div className="flex justify-between min-w-[200px] flex-1 max-w-[300px]">
                            <span className="text-muted-foreground">
                                This month:
                            </span>
                            <span className="font-medium text-foreground">
                                0 uploads
                            </span>
                        </div>
                        <div className="flex justify-between min-w-[200px] flex-1 max-w-[300px]">
                            <span className="text-muted-foreground">
                                Avg. duration:
                            </span>
                            <span className="font-medium text-foreground">
                                --
                            </span>
                        </div>
                        <div className="flex justify-between min-w-[200px] flex-1 max-w-[300px]">
                            <span className="text-muted-foreground">
                                Most popular:
                            </span>
                            <span className="font-medium text-foreground">
                                --
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedSection;

import React, { useState } from 'react';
import { router } from 'expo-router';

import ScreenView from '@/components/ui/screenview';
import SeriesPicker from '@/components/features/pickers/series-picker';
import { theme } from '@/constants/theme';

/**
 * Modal: choose followed series (Figma parity). Open via `router.push('/choose-series')`.
 */
export default function ChooseSeriesModal() {
    const [loading, setLoading] = useState(false);

    return (
        <ScreenView
            screenStyle={{
                flex: 1,
                marginTop: theme.sizes.spacing.lg,
                paddingHorizontal: theme.sizes.spacing.md,
                backgroundColor: theme.colors.grey[900],
            }}
        >
            <SeriesPicker
                title="Choose series"
                searchPlaceholder="Search series"
                primaryLabel="Done"
                showClose
                onClose={() => router.back()}
                loading={loading}
                loadingTitle="Adding to Your Library"
                onPrimaryPress={async () => {
                    setLoading(true);
                    await new Promise((r) => setTimeout(r, 900));
                    setLoading(false);
                    router.back();
                }}
            />
        </ScreenView>
    );
}

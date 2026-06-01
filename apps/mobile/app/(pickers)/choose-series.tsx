import React, { useState } from 'react';
import { router } from 'expo-router';

import ScreenView from '@/components/ui/screenview';
import SeriesPicker from '@/components/features/pickers/series-picker';
import { theme } from '@/constants/theme';

export default function ChooseSeriesModal() {
    const [selected, setSelected] = useState<string[]>([]);
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
                selectedIds={selected}
                onSelectionChange={setSelected}
                onClose={() => router.back()}
                loading={loading}
                loadingTitle="Saving selection"
                onPrimaryPress={async () => {
                    setLoading(true);
                    try {
                        router.back();
                    } finally {
                        setLoading(false);
                    }
                }}
            />
        </ScreenView>
    );
}

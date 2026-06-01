import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import ScreenView from '@/components/ui/screenview';
import MinisterPicker from '@/components/features/pickers/minister-picker';
import { theme } from '@/constants/theme';
import { useOnboardMinistersMutation } from '@/api/hooks/app/useListenerOnboarding';

export default function PickMinistersModal() {
    const [selected, setSelected] = useState<string[]>([]);
    const onboard = useOnboardMinistersMutation();

    return (
        <ScreenView
            screenStyle={{
                flex: 1,
                marginTop: theme.sizes.spacing.lg,
                paddingHorizontal: theme.sizes.spacing.md,
                backgroundColor: theme.colors.grey[900],
            }}
        >
            <MinisterPicker
                title="Pick ministers you like"
                subtitle="Ministers unlock library content. The more you listen, the more tailored your experience."
                searchPlaceholder="Search ministers"
                minSelection={1}
                primaryLabel="Follow Ministers"
                selectedIds={selected}
                onSelectionChange={setSelected}
                onPrimaryPress={(ids) => {
                    onboard.mutate(
                        { ministerIds: ids },
                        { onSuccess: () => router.back() },
                    );
                }}
                showClose
                onClose={() => router.back()}
            />
        </ScreenView>
    );
}

import React from 'react';
import { router } from 'expo-router';

import ScreenView from '@/components/ui/screenview';
import MinisterPicker from '@/components/features/pickers/minister-picker';
import { theme } from '@/constants/theme';

/**
 * Modal: pick ministers (Figma parity). Open via `router.push('/pick-ministers')`.
 */
export default function PickMinistersModal() {
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
                onPrimaryPress={() => router.back()}
                showClose
                onClose={() => router.back()}
            />
        </ScreenView>
    );
}

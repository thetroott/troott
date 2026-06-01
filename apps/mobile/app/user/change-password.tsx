import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import ChangePasswordForm from '@/components/features/auth/forms/change-password-form';
import Header from '@/components/features/shared/headers';
import ScreenModalAndroidView from '@/components/ui/screen-modal-android';
import { theme } from '@/constants/theme';

export default function ChangePasswordRoute() {
    return (
        <ScreenModalAndroidView>
            <View style={styles.container}>
                <Header variant="playlist" title="Change password" />
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <ChangePasswordForm />
                </ScrollView>
            </View>
        </ScreenModalAndroidView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.grey[900],
        paddingVertical: 16,
        gap: theme.sizes.spacing.md,
        borderTopRightRadius: theme.sizes.radius.base,
        borderTopLeftRadius: theme.sizes.radius.base,
        flex: 1,
    },
    scrollView: {
        paddingHorizontal: theme.sizes.spacing.md,
        paddingBottom: theme.sizes.spacing.xl,
    },
});

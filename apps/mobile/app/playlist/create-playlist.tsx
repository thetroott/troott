import { StyleSheet, View } from 'react-native';
import React from 'react';
import { router } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';
import CreatePlaylistForm from '@/components/features/playlist/create-playlist-form';
import Header from '@/components/features/shared/headers';
import ScreenModalAndroidView from '@/components/ui/screen-modal-android';
import { theme } from '@/constants/theme';

const CreatePlayListScreen = () => {
    return (
        <ScreenModalAndroidView>
            <View style={styles.container}>
                <Header variant="playlist" title="Create Playlist" />
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    nestedScrollEnabled
                >
                    <CreatePlaylistForm
                        onCreated={() => {
                            router.back();
                        }}
                    />
                </ScrollView>
            </View>
        </ScreenModalAndroidView>
    );
};

export default CreatePlayListScreen;

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
        gap: theme.sizes.spacing.md,
    },
});

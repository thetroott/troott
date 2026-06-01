import { StyleSheet, View } from 'react-native';
import React, { useCallback } from 'react';
import { router } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';
import CreatePlaylistForm from '@/components/features/playlist/create-playlist-form';
import Header from '@/components/features/shared/headers';
import ScreenModalAndroidView from '@/components/ui/screen-modal-android';
import { theme } from '@/constants/theme';
import { useCreatePlaylistMutation } from '@/api/hooks/app/usePlaylist';
import {
    PlaylistOwnerType,
    PlaylistType,
    PlaylistVisibility,
} from '@/models/Playlist.model';
import type { PlayListValidationSchemaType } from '@/validation/playlist';
import { toast } from '@/components/ui/toast';
import { useNetworkStatus } from '@/lib/state/network-store';
import { networkStatusTypes } from '@/api/dtos/network.dto';

function readCreatedPlaylistId(data: unknown): string | null {
    if (data == null || typeof data !== 'object') return null;
    const d = data as Record<string, unknown>;
    const raw = d.id ?? d._id;
    if (raw == null) return null;
    const id = String(raw);
    return id.length > 0 ? id : null;
}

const CreatePlayListScreen = () => {
    const createMutation = useCreatePlaylistMutation();
    const [networkStatus] = useNetworkStatus();

    const handleCreated = useCallback(
        async (values: PlayListValidationSchemaType) => {
            if (networkStatus === networkStatusTypes.DISCONNECTED) {
                toast.error('You are offline. Connect to create a playlist.');
                return;
            }

            try {
                const res = await createMutation.mutateAsync({
                    title: values.title.trim(),
                    description: values.description?.trim() || undefined,
                    banner: values.image?.trim() || undefined,
                    playlistType: PlaylistType.LISTENER,
                    ownerType: PlaylistOwnerType.LISTENER,
                    visibility: values.private
                        ? PlaylistVisibility.PRIVATE
                        : PlaylistVisibility.PUBLIC,
                    isCollaborative: values.collaborative ?? false,
                });

                if (res.error) {
                    toast.error(res.message || 'Could not create playlist');
                    return;
                }

                toast.success('Playlist created');
                const createdId = readCreatedPlaylistId(res.data);
                if (createdId) {
                    router.replace(`/playlist/${createdId}`);
                    return;
                }
                router.back();
            } catch (e) {
                const msg =
                    e instanceof Error ? e.message : 'Could not create playlist';
                toast.error(msg);
            }
        },
        [createMutation, networkStatus],
    );

    return (
        <ScreenModalAndroidView>
            <View style={styles.container}>
                <Header variant="playlist" title="Create Playlist" />
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    nestedScrollEnabled
                >
                    <CreatePlaylistForm
                        isSubmitting={createMutation.isPending}
                        onCreated={(values) => {
                            void handleCreated(values);
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

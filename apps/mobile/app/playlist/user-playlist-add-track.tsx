import { Pressable, StyleSheet, View } from 'react-native';
import React from 'react';
import { router } from 'expo-router';

import PlaylistAddTrackContent from '@/components/features/playlist/playlist-add-track-content';
import { DEFAULT_CHOOSE_PLAYLISTS } from '@/components/features/playlist/use-add-to-playlist';
import ScreenModalAndroidView from '@/components/ui/screen-modal-android';

const UserPlayList = () => {
    return (
        <ScreenModalAndroidView>
            <View style={styles.root}>
                <Pressable
                    style={styles.backdrop}
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                />
                <View style={styles.foreground} pointerEvents="box-none">
                    <PlaylistAddTrackContent
                        initialPlaylists={DEFAULT_CHOOSE_PLAYLISTS}
                    />
                </View>
            </View>
        </ScreenModalAndroidView>
    );
};

export default UserPlayList;

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    foreground: {
        flex: 1,
        justifyContent: 'flex-end',
    },
});

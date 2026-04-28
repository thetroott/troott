/**
 * Playlist detail placeholder. "Create playlist" form lives at
 * `app/playlist/create-playlist.tsx` (and optional embeds in bottom sheets), not here.
 */
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ScreenView from '@/components/ui/screenview';
import Text from '@/components/ui/text';
import { View } from 'react-native';

export default function PlaylistScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <ScreenView>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Text>Playlist {id ?? '—'}</Text>
            </View>
        </ScreenView>
    );
}

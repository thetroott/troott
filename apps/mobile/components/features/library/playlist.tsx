import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { OutlineIcons } from '@/assets/icons';
import { theme } from '@/constants/theme';
import PlayListCard from '@/components/features/playlist/playlist-card';

interface PlaylistProps {
    isGrid: boolean;
}

const Playlists = ({ isGrid }: PlaylistProps) => {
    return (
        <View>
            <PlayListCard
                icon={OutlineIcons.HeartIcon}
                title="Liked Sermons"
                description="Auto playlist - 6 sermons"
                id="liked-sermons"
                cardStyle={{
                    width: isGrid ? theme.sizes.screen.width * 0.42 : '100%',
                }}
            />
            <PlayListCard
                title="My Playlists"
                description="2 playlists"
                image="https://picsum.photos/200/300"
                id="my-playlists-a"
                variant={isGrid ? 'large' : 'small'}
                cardStyle={{
                    width: isGrid ? theme.sizes.screen.width * 0.42 : '100%',
                }}
            />
            <PlayListCard
                title="My Playlists"
                description="2 playlists"
                image="https://picsum.photos/100/300"
                id="my-playlists-b"
                variant={isGrid ? 'large' : 'small'}
                cardStyle={{
                    width: isGrid ? theme.sizes.screen.width * 0.42 : '100%',
                }}
            />
        </View>
    );
};

export default Playlists;

const styles = StyleSheet.create({});

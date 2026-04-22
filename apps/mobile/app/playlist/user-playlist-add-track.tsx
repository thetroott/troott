import { Pressable, StyleSheet, View } from 'react-native';
import React from 'react';
import Text from '@/components/ui/text';
import Header from '@/components/features/shared/headers';
import { theme } from '@/constants/theme';
import Input from '@/components/ui/input';
import { SearchNormal } from 'iconsax-react-nativejs';

import { SolidIcons } from '@/assets/icons';
import ScreenModalAndroidView from '@/components/ui/screen-modal-android';
import { ScrollView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import PlayListCard from '@/components/features/playlist/playlist-card';

const UserPlayList = () => {
    return (
        <ScreenModalAndroidView>
            <View style={styles.container}>
                <Header title="Your Playlist" variant="playlist" />
                <Input
                    placeholder="Find in playlist"
                    leftIcon={
                        <SearchNormal
                            color={theme.colors.grey[200]}
                            size={18}
                        />
                    }
                    placeholderTextColor={theme.colors.grey[200]}
                    containerstyle={{
                        backgroundColor: theme.colors.grey[700],
                        borderRadius: theme.sizes.radius.base,
                        borderWidth: 0,
                        marginHorizontal: theme.sizes.spacing.md,
                    }}
                />
                <ScrollView
                    contentContainerStyle={{
                        paddingHorizontal: theme.sizes.spacing.md,
                        gap: theme.sizes.spacing.md,
                    }}
                    nestedScrollEnabled
                >
                    <NewPlayList />
                    <AllPlayList />
                </ScrollView>
            </View>
        </ScreenModalAndroidView>
    );
};

function NewPlayList() {
    function handleCreatePlaylist() {
        // Navigate to create playlist screen
        router.replace('/playlist/create-playlist');
    }
    return (
        <Pressable
            style={styles.newPlaylistContainer}
            onPress={handleCreatePlaylist}
        >
            <View style={styles.addBtnContainer}>
                <SolidIcons.PlusIcon color={theme.colors.white[50]} size={22} />
            </View>
            <Text color={theme.colors.white[50]} size="md">
                New playlist
            </Text>
        </Pressable>
    );
}

function AllPlayList() {
    return (
        <View
            style={{
                gap: theme.sizes.spacing.lg,
                marginTop: theme.sizes.spacing.lg,
            }}
        >
            <Text color={theme.colors.grey[200]} size="md" weight="medium">
                All Playlists
            </Text>
            <View style={{ gap: theme.sizes.spacing.md }}>
                {[...Array(2)].map((_, index) => (
                    <PlayListCard
                        title="Loved Sermon"
                        description="Auto playlist"
                        id={`loved-sermon-${index}`}
                        key={index}
                    />
                ))}
            </View>
        </View>
    );
}

export default UserPlayList;

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.grey[900],
        paddingVertical: 16,
        gap: theme.sizes.spacing.md,
        borderTopRightRadius: theme.sizes.radius.base,
        borderTopLeftRadius: theme.sizes.radius.base,
        flex: 1,
    },
    newPlaylistContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.md,
        marginTop: theme.sizes.spacing.md,
    },
    addBtnContainer: {
        backgroundColor: theme.colors.grey[800],
        padding: theme.sizes.spacing.lg,
        borderRadius: theme.sizes.radius.base,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

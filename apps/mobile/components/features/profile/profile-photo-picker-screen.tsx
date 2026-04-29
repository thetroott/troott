import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { CloseCircle } from 'iconsax-react-nativejs';
import { router } from 'expo-router';

import ScreenView from '@/components/ui/screenview';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

const photos = [
    require('@/assets/images/1.jpg'),
    require('@/assets/images/2.jpg'),
    require('@/assets/images/3.jpg'),
    require('@/assets/images/4.jpg'),
    require('@/assets/images/5.jpg'),
    require('@/assets/images/6.jpg'),
    require('@/assets/images/7.jpg'),
    require('@/assets/images/8.jpg'),
    require('@/assets/images/9.jpg'),
    require('@/assets/images/cover.jpg'),
    require('@/assets/images/cover2.jpg'),
    require('@/assets/images/cover3.jpg'),
];

export default function ProfilePhotoPickerScreen() {
    return (
        <ScreenView screenStyle={styles.screen}>
            <View style={styles.topBar}>
                <Pressable onPress={() => router.back()}>
                    <CloseCircle size={22} color="#2B2A2C" />
                </Pressable>
                <Text size="xl" weight="medium" color="#2B2A2C">
                    Select a photo
                </Text>
                <View style={styles.spacer} />
            </View>

            <FlatList
                data={photos}
                keyExtractor={(_, index) => `photo-${index}`}
                numColumns={3}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={styles.column}
                renderItem={({ item }) => (
                    <Pressable onPress={() => router.push('/user/edit-profile-saved')}>
                        <Image source={item} style={styles.photo} />
                    </Pressable>
                )}
                ListHeaderComponent={
                    <Text size="xl" weight="medium" color="#333234" textStyle={styles.dayText}>
                        Mon, Jun 23
                    </Text>
                }
            />
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 0,
        gap: 0,
    },
    topBar: {
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.sizes.spacing.base,
    },
    spacer: {
        width: 22,
    },
    grid: {
        gap: 4,
        paddingBottom: 40,
    },
    column: {
        gap: 4,
    },
    dayText: {
        paddingHorizontal: theme.sizes.spacing.base,
        marginVertical: 16,
    },
    photo: {
        width: 122,
        height: 129,
    },
});

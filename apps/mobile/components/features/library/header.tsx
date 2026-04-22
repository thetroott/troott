import { Pressable, StyleSheet, View } from 'react-native';
import React from 'react';
import { Notification, SearchNormal, Sms } from 'iconsax-react-nativejs';
import { theme } from '@/constants/theme';
import Text from '@/components/ui/text';

const LibraryHeader = () => {
    return (
        <View style={styles.container}>
            <Text weight="semiBold" size="xl" color={theme.colors.white[50]}>
                Library
            </Text>
            <View style={styles.iconContainer}>
                <Pressable>
                    <SearchNormal color={theme.colors.white[50]} size={20} />
                </Pressable>
                <Pressable>
                    <Notification
                        color={theme.colors.white[50]}
                        variant="Bold"
                        size={20}
                    />
                </Pressable>
            </View>
        </View>
    );
};

export default LibraryHeader;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconContainer: {
        flexDirection: 'row',
        gap: theme.sizes.spacing.md,
        alignItems: 'center',
    },
});

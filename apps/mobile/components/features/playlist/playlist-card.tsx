import { Image, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import React from 'react';
import Text from '@/components/ui/text';
import { SolidIcons } from '@/assets/icons';
import { theme } from '@/constants/theme';
import { Icon } from 'iconsax-react-nativejs';

interface PlayListCardItemProps {
    image?: string;
    title?: string;
    description?: string;
    onPress?: () => void;
    id: string;
    icon?: Icon;
    variant?: 'large' | 'small';
    cardStyle?: ViewStyle;
}

const PlayListCard = ({
    image,
    title,
    description,
    onPress,
    id,
    icon,
    variant = 'small',
    cardStyle,
}: PlayListCardItemProps) => {
    const Icon = icon;
    if (variant === 'large') {
        return (
            <View style={[{ gap: theme.sizes.spacing.md }, cardStyle]}>
                <React.Fragment>
                    {image && (
                        <Image
                            source={{
                                uri: image || 'https://picsum.photos/200/300',
                            }}
                            style={styles.imageLarge}
                        />
                    )}
                    {Icon && (
                        <View
                            style={{
                                padding: theme.sizes.spacing.xs,
                                backgroundColor: '#02332C',
                                ...styles.imageLarge,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Icon color="#08FFDB" size={48} />
                        </View>
                    )}
                </React.Fragment>
                <View style={styles.textContainer}>
                    <Text
                        size="base"
                        color={theme.colors.white[50]}
                        weight="medium"
                    >
                        {title}
                    </Text>
                    <Text size="xs">{description}</Text>
                </View>
            </View>
        );
    }
    return (
        <Pressable onPress={onPress} style={[styles.container, cardStyle]}>
            <View style={styles.imageContainer}>
                {image && (
                    <Image
                        source={{
                            uri: image || 'https://picsum.photos/200/300',
                        }}
                        style={styles.image}
                    />
                )}
                {icon && (
                    <View
                        style={{
                            padding: theme.sizes.spacing.xs,
                            backgroundColor: '#02332C',
                            borderRadius: theme.sizes.radius.xs,
                        }}
                    >
                        {Icon && <Icon color="#08FFDB" size={18} />}
                    </View>
                )}
                <View style={styles.textContainer}>
                    <Text
                        size="base"
                        color={theme.colors.white[50]}
                        weight="medium"
                    >
                        {title}
                    </Text>
                    <Text size="xs">{description}</Text>
                </View>
            </View>
            <Pressable>
                <SolidIcons.ChevronRightIcon color={'#BDBDBD'} size={16} />
            </Pressable>
        </Pressable>
    );
};

export default PlayListCard;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        justifyContent: 'space-between',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.grey[600],
        paddingBottom: theme.sizes.spacing.md,
    },
    image: {
        width: theme.sizes.screen.width * 0.1,
        height: theme.sizes.screen.width * 0.1,
        borderRadius: theme.sizes.radius.sm,
    },
    textContainer: {
        gap: theme.sizes.spacing.sm,
    },
    imageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.sizes.spacing.md,
    },
    imageLarge: {
        width: '100%',
        height: theme.sizes.screen.height * 0.2,
        borderRadius: theme.sizes.radius.base,
    },
});

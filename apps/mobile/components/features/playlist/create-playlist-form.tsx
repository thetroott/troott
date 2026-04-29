import { Image, Pressable, StyleSheet, View } from 'react-native';
import React from 'react';
import { SolidIcons } from '@/assets/icons';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '@/components/ui/forminput';
import { theme } from '@/constants/theme';
import Text from '@/components/ui/text';
import * as ImagePicker from 'expo-image-picker';
import FormSwitch from '@/components/ui/form-switch';

import Button from '@/components/ui/button';
import {
    PlayListValidationSchema,
    PlayListValidationSchemaType,
} from '@/validation/playlist';
import { IncognitoIcon } from '@/components/features/shared/Icons';

export type CreatePlaylistFormProps = {
    /** When set, submit does not leave the flow (e.g. in-memory step after "New playlist"). */
    onCreated?: (values: PlayListValidationSchemaType) => void;
    /** Slightly tighter spacing for bottom-sheet step. */
    compact?: boolean;
};

const CreatePlaylistForm = ({
    onCreated,
    compact = false,
}: CreatePlaylistFormProps) => {
    const { control, handleSubmit, setValue } =
        useForm<PlayListValidationSchemaType>({
            defaultValues: {
                title: '',
                description: '',
                image: '',
                collaborative: false,
                private: false,
            },
            resolver: zodResolver(PlayListValidationSchema),
        });

    const [image, setImage] = React.useState<string | null>(null);

    const handleImagePicker = React.useCallback(async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            setValue('image', imageUri);
            setImage(imageUri);
        } else {
            console.log('Image picker was canceled');
        }
    }, [setValue]);

    const onSubmit = handleSubmit((values) => {
        onCreated?.(values);
    });

    return (
        <View>
            <Pressable
                style={[styles.camera, compact && styles.cameraCompact]}
                onPress={handleImagePicker}
            >
                {!image && (
                    <SolidIcons.CameraIcon
                        color={theme.colors.white[50]}
                        size={30}
                    />
                )}
                {image && (
                    <Image
                        source={{
                            uri: image,
                        }}
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 15,
                        }}
                    />
                )}
            </Pressable>
            <View style={{ gap: theme.sizes.spacing.lg }}>
                <FormInput
                    label="Name"
                    control={control}
                    name="title"
                    placeholder="Playlist name"
                />
                <FormInput
                    label="Description"
                    control={control}
                    name="description"
                    // multiline
                    placeholder="Uplift, inspire and share the word"
                />

                <View
                    style={{
                        gap: theme.sizes.spacing.md,
                        marginTop: theme.sizes.spacing.lg,
                    }}
                >
                    <View>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: theme.sizes.spacing.sm,
                                }}
                            >
                                <View style={styles.iconBackground}>
                                    <SolidIcons.UsersIcon
                                        color={theme.colors.grey[200]}
                                        size={20}
                                    />
                                </View>
                                <View style={{ gap: theme.sizes.spacing.xs }}>
                                    <Text
                                        color={theme.colors.grey[200]}
                                        size="base"
                                    >
                                        Collaborative
                                    </Text>
                                    <Text
                                        size="xs"
                                        color={theme.colors.grey[500]}
                                    >
                                        All others to add tracks
                                    </Text>
                                </View>
                            </View>
                            <FormSwitch
                                control={control}
                                name="collaborative"
                            />
                        </View>
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: theme.sizes.spacing.sm,
                            }}
                        >
                            <View style={styles.iconBackground}>
                                <IncognitoIcon
                                    color={theme.colors.grey[200]}
                                    height={20}
                                    width={20}
                                />
                            </View>
                            <View style={{ gap: theme.sizes.spacing.xs }}>
                                <Text
                                    color={theme.colors.grey[200]}
                                    size="base"
                                >
                                    Private
                                </Text>
                            </View>
                        </View>
                        <FormSwitch control={control} name="private" />
                    </View>
                </View>
                <Button
                    label="Create playlist"
                    onPress={onSubmit}
                    containerStyle={{
                        marginTop: theme.sizes.spacing.xl,
                        width: '100%',
                    }}
                />
            </View>
        </View>
    );
};

export default CreatePlaylistForm;

const styles = StyleSheet.create({
    camera: {
        borderRadius: 15,
        backgroundColor: theme.colors.grey[700],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        width: theme.sizes.screen.width * 0.4,
        height: theme.sizes.screen.width * 0.4,
        alignSelf: 'center',
        elevation: 5,
        shadowColor: theme.colors.grey[500],
        marginTop: theme.sizes.spacing.md,
    },
    cameraCompact: {
        marginTop: theme.sizes.spacing.sm,
    },
    iconBackground: {
        backgroundColor: theme.colors.grey[700],
        padding: theme.sizes.spacing.base,
        borderRadius: 100,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.sm,
    },
});

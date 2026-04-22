import React from 'react';
import {
    Image,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { ArrowLeft2, Camera, CloseCircle } from 'iconsax-react-nativejs';
import { router } from 'expo-router';

import ScreenView from '@/components/ui/screenview';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import { useUploadPhoto } from '@/hooks/useUploadPhoto';

type FieldProps = {
    label: string;
    value: string;
    hint?: string;
};

function EditField({ label, value, hint }: FieldProps) {
    return (
        <View style={styles.fieldWrap}>
            <Text size="sm" color={theme.colors.grey[100]}>
                {label}
            </Text>
            <TextInput
                defaultValue={value}
                placeholderTextColor={theme.colors.grey[100]}
                style={styles.fieldInput}
            />
            {hint ? (
                <Text size="sm" color={theme.colors.grey[100]} textStyle={styles.hint}>
                    {hint}
                </Text>
            ) : null}
        </View>
    );
}

type ProfileEditScreenProps = {
    showSavingOverlay?: boolean;
};

export default function ProfileEditScreen({
    showSavingOverlay = false,
}: ProfileEditScreenProps) {
    const [showPhotoAction, setShowPhotoAction] = React.useState(false);
    const [showSaving, setShowSaving] = React.useState(showSavingOverlay);
    const [avatarUri, setAvatarUri] = React.useState<string | null>(null);
    const baseUrl = process.env.EXPO_PUBLIC_TROOTT_API_URL;
    const uploadEndpoint = baseUrl ? `${baseUrl}/user` : undefined;
    const { captureFromCamera, selectFromGallery, isUploading } = useUploadPhoto({
        uploadEndpoint,
        onSuccess: (imageUrl) => {
            if (typeof imageUrl === 'string' && imageUrl.length > 0) {
                setAvatarUri(imageUrl);
            }
        },
    });

    React.useEffect(() => {
        setShowSaving(showSavingOverlay);
    }, [showSavingOverlay]);

    React.useEffect(() => {
        if (showSavingOverlay) {
            setShowSaving(true);
            return;
        }
        setShowSaving(isUploading);
    }, [isUploading, showSavingOverlay]);

    return (
        <ScreenView screenStyle={styles.screen}>
            <View style={styles.topBar}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft2 size={16} color={theme.colors.white[50]} />
                </Pressable>
                <Text size="lg" weight="semiBold" color={theme.colors.white[50]}>
                    Edit profile
                </Text>
                <Pressable
                    style={styles.saveBtn}
                    onPress={() => {
                        setShowSaving(isUploading);
                    }}
                >
                    <Text size="base" weight="medium" color={theme.colors.teal[500]}>
                        Save
                    </Text>
                </Pressable>
            </View>

            <View style={styles.hero}>
                <Image source={require('@/assets/images/cover4.jpg')} style={styles.cover} />
                <Pressable style={styles.coverAction} onPress={() => setShowPhotoAction(true)}>
                    <Camera size={20} color={theme.colors.white[50]} />
                </Pressable>
            </View>

            <Pressable
                style={styles.avatarWrap}
                onPress={() => setShowPhotoAction(true)}
            >
                <Image
                    source={
                        avatarUri ? { uri: avatarUri } : require('@/assets/images/4.jpg')
                    }
                    style={styles.avatar}
                />
                <View style={styles.avatarCamera}>
                    <Camera size={20} color={theme.colors.white[50]} />
                </View>
            </Pressable>

            <View style={styles.form}>
                <EditField label="First Name" value="Tobe" hint="4/12" />
                <EditField label="Last Name" value="Innocent" hint="8/15" />
                <EditField label="Email" value="tobeinnocent@email.com" />
            </View>

            {showPhotoAction ? (
                <>
                    <Pressable
                        style={styles.backdrop}
                        onPress={() => setShowPhotoAction(false)}
                    />
                    <View style={styles.sheet}>
                        <View style={styles.sheetHeader}>
                            <Text size="base" weight="medium" color={theme.colors.grey[50]}>
                                Update picture
                            </Text>
                            <Pressable onPress={() => setShowPhotoAction(false)}>
                                <CloseCircle size={20} color={theme.colors.grey[50]} />
                            </Pressable>
                        </View>
                        <Pressable
                            style={styles.sheetRow}
                            onPress={async () => {
                                setShowPhotoAction(false);
                                await captureFromCamera();
                            }}
                        >
                            <Text size="lg" color={theme.colors.grey[50]}>
                                Take photo
                            </Text>
                        </Pressable>
                        <Pressable
                            style={styles.sheetRow}
                            onPress={async () => {
                                setShowPhotoAction(false);
                                await selectFromGallery();
                            }}
                        >
                            <Text size="lg" color={theme.colors.grey[50]}>
                                Choose picture
                            </Text>
                        </Pressable>
                    </View>
                </>
            ) : null}

            {showSaving ? (
                <View style={styles.savingBackdrop}>
                    <View style={styles.savingToast}>
                        <Text size="base" color={theme.colors.grey[50]}>
                            Saving...
                        </Text>
                    </View>
                </View>
            ) : null}
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: theme.colors.black[50],
        paddingHorizontal: 0,
        gap: 0,
    },
    topBar: {
        height: 42,
        paddingHorizontal: theme.sizes.spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtn: {
        minWidth: 40,
        alignItems: 'flex-end',
    },
    hero: {
        marginTop: 12,
        height: 128,
    },
    cover: {
        width: '100%',
        height: 128,
    },
    coverAction: {
        position: 'absolute',
        right: theme.sizes.spacing.base,
        bottom: theme.sizes.spacing.base,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarWrap: {
        marginTop: -64,
        marginLeft: theme.sizes.spacing.base,
        width: 117,
        height: 117,
        borderRadius: theme.sizes.radius.full,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 117,
        height: 117,
        borderRadius: theme.sizes.radius.full,
    },
    avatarCamera: {
        position: 'absolute',
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    form: {
        marginTop: 24,
        paddingHorizontal: theme.sizes.spacing.base,
        gap: 24,
    },
    fieldWrap: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(84,84,84,0.5)',
        paddingBottom: 8,
        gap: 2,
    },
    fieldInput: {
        padding: 0,
        color: theme.colors.grey[50],
        fontSize: 32 / 2,
        fontFamily: 'Matter-Medium',
        lineHeight: 24,
    },
    hint: {
        textAlign: 'right',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(84,84,84,0.5)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 28,
    },
    sheetHeader: {
        height: 52,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(84,84,84,0.5)',
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sheetRow: {
        height: 44,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    savingBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    savingToast: {
        width: 326,
        height: 80,
        borderRadius: 4,
        backgroundColor: '#3A3636',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
});

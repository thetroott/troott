import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
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
import { toast } from '@/components/ui/toast';
import { useUploadPhoto } from '@/api/hooks/shared/useUploadPhoto';
import { useUpdateProfileMutation } from '@/api/hooks/app/useUser';
import { useContextType } from '@/context';
import { useProfileIdentity } from './use-profile-identity';

const MAX_NAME_LENGTH = 50;

type FieldProps = {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    editable?: boolean;
    hint?: string;
};

function EditField({
    label,
    value,
    onChangeText,
    editable = true,
    hint,
}: FieldProps) {
    return (
        <View style={styles.fieldWrap}>
            <Text size="sm" color={theme.colors.grey[100]}>
                {label}
            </Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                editable={editable}
                placeholderTextColor={theme.colors.grey[100]}
                style={[styles.fieldInput, !editable && styles.fieldReadOnly]}
            />
            {hint ? (
                <Text size="sm" color={theme.colors.grey[100]} textStyle={styles.hint}>
                    {hint}
                </Text>
            ) : null}
        </View>
    );
}

function readString(user: Record<string, unknown> | null, key: string): string {
    if (!user) return '';
    const value = user[key];
    return typeof value === 'string' ? value.trim() : '';
}

type ProfileEditScreenProps = {
    showSavingOverlay?: boolean;
};

export default function ProfileEditScreen({
    showSavingOverlay = false,
}: ProfileEditScreenProps) {
    const { userContext } = useContextType();
    const user = userContext.user as Record<string, unknown> | null;
    const { avatarSource } = useProfileIdentity();
    const updateProfile = useUpdateProfileMutation();

    const initial = useMemo(
        () => ({
            firstName: readString(user, 'firstName'),
            lastName: readString(user, 'lastName'),
            email: readString(user, 'email'),
            avatar: readString(user, 'avatar'),
        }),
        [user],
    );

    const [firstName, setFirstName] = useState(initial.firstName);
    const [lastName, setLastName] = useState(initial.lastName);
    const [avatarUri, setAvatarUri] = useState<string | null>(
        initial.avatar || null,
    );
    const [showPhotoAction, setShowPhotoAction] = useState(false);

    React.useEffect(() => {
        setFirstName(initial.firstName);
        setLastName(initial.lastName);
        setAvatarUri(initial.avatar || null);
    }, [initial.firstName, initial.lastName, initial.avatar]);

    const dirty =
        firstName.trim() !== initial.firstName ||
        lastName.trim() !== initial.lastName ||
        (avatarUri ?? '') !== (initial.avatar || '');

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

    const isSaving = showSavingOverlay || isUploading || updateProfile.isPending;

    const confirmLeave = useCallback(
        (onLeave: () => void) => {
            if (!dirty) {
                onLeave();
                return;
            }
            Alert.alert(
                'Discard changes?',
                'You have unsaved profile edits.',
                [
                    { text: 'Keep editing', style: 'cancel' },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: onLeave,
                    },
                ],
            );
        },
        [dirty],
    );

    const handleBack = useCallback(() => {
        confirmLeave(() => router.back());
    }, [confirmLeave]);

    const handleSave = useCallback(async () => {
        const trimmedFirst = firstName.trim();
        const trimmedLast = lastName.trim();

        if (trimmedFirst.length < 2) {
            toast.error('First name must be at least 2 characters.');
            return;
        }

        try {
            const payload: Record<string, unknown> = {
                firstName: trimmedFirst,
                lastName: trimmedLast,
            };
            if (avatarUri && avatarUri.length > 0) {
                payload.avatar = avatarUri;
            }

            const res = await updateProfile.mutateAsync(payload);
            if (res.error) {
                toast.error(res.message || 'Could not save profile');
                return;
            }

            toast.success('Profile updated');
            router.back();
        } catch (e) {
            const msg =
                e instanceof Error ? e.message : 'Could not save profile';
            toast.error(msg);
        }
    }, [avatarUri, firstName, lastName, updateProfile]);

    const avatarImage =
        avatarUri != null && avatarUri.length > 0
            ? { uri: avatarUri }
            : avatarSource;

    return (
        <ScreenView screenStyle={styles.screen}>
            <View style={styles.topBar}>
                <Pressable
                    style={styles.backBtn}
                    onPress={handleBack}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <ArrowLeft2 size={16} color={theme.colors.white[50]} />
                </Pressable>
                <Text size="lg" weight="semiBold" color={theme.colors.white[50]}>
                    Edit profile
                </Text>
                <Pressable
                    style={styles.saveBtn}
                    onPress={() => void handleSave()}
                    disabled={isSaving || !dirty}
                    accessibilityRole="button"
                    accessibilityLabel="Save profile"
                >
                    <Text
                        size="base"
                        weight="medium"
                        color={
                            isSaving || !dirty
                                ? theme.colors.grey[500]
                                : theme.colors.teal[500]
                        }
                    >
                        Save
                    </Text>
                </Pressable>
            </View>

            <View style={styles.hero}>
                <Image source={require('@/assets/images/cover4.jpg')} style={styles.cover} />
                <Pressable
                    style={styles.coverAction}
                    onPress={() => router.push('/user/photo-picker')}
                >
                    <Camera size={20} color={theme.colors.white[50]} />
                </Pressable>
            </View>

            <Pressable
                style={styles.avatarWrap}
                onPress={() => setShowPhotoAction(true)}
            >
                <Image source={avatarImage} style={styles.avatar} />
                <View style={styles.avatarCamera}>
                    <Camera size={20} color={theme.colors.white[50]} />
                </View>
            </Pressable>

            <View style={styles.form}>
                <EditField
                    label="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    hint={`${firstName.trim().length}/${MAX_NAME_LENGTH}`}
                />
                <EditField
                    label="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    hint={`${lastName.trim().length}/${MAX_NAME_LENGTH}`}
                />
                <EditField
                    label="Email"
                    value={initial.email}
                    onChangeText={() => {}}
                    editable={false}
                />
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

            {isSaving ? (
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
        fontSize: 16,
        fontFamily: 'Matter-Medium',
        lineHeight: 24,
    },
    fieldReadOnly: {
        color: theme.colors.grey[300],
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

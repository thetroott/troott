import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

interface UploadState {
    isUploading: boolean;
    progress: number;
}

interface IUploadPhoto {
    uploadEndpoint?: string;
    maxFileSizeMB?: number;
    quality?: number;
    onSuccess?: (imageUrl: string) => void;
    onError?: (error: string) => void;
}

interface UseUploadPhotoReturn {
    uploadState: UploadState;
    captureFromCamera: () => Promise<void>;
    selectFromGallery: () => Promise<void>;
    isUploading: boolean;
}

export const useUploadPhoto = (data: IUploadPhoto = {}): UseUploadPhotoReturn => {

    const {
        uploadEndpoint = 'YOUR_UPLOAD_ENDPOINT_HERE',
        maxFileSizeMB = 10,
        quality = 0.8,
        onSuccess,
        onError,
    } = data

    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        progress: 0
    });

    // Request permissions helper
    const requestPermissions = useCallback(async (): Promise<boolean> => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
            Alert.alert(
                'Permissions Required',
                'Please enable camera and photo library permissions to upload images.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    }, []);

    // Image validation
    const validateImage = useCallback(async (imageUri: string): Promise<boolean> => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(imageUri);

            if (!fileInfo.exists) {
                throw new Error('File does not exist');
            }

            // Check file size
            const maxSizeInBytes = maxFileSizeMB * 1024 * 1024;
            if (fileInfo.size && fileInfo.size > maxSizeInBytes) {
                Alert.alert('File Too Large', `Please select an image smaller than ${maxFileSizeMB}MB`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error validating image:', error);
            Alert.alert('Error', 'Failed to validate the selected image');
            return false;
        }
    }, [maxFileSizeMB]);

    // Upload image to server
    const uploadImage = useCallback(async (imageUri: string): Promise<string | null> => {
        try {
            setUploadState({ isUploading: true, progress: 0 });

            // Create FormData for multipart upload
            const formData = new FormData();

            // Get file extension
            const uriParts = imageUri.split('.');
            const fileType = uriParts[uriParts.length - 1];

            formData.append('avatar', {
                uri: imageUri,
                name: `avatar_${Date.now()}.${fileType}`,
                type: `image/${fileType}`,
            } as any);

            setUploadState(prev => ({ ...prev, progress: 25 }));

            const response = await fetch(uploadEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Add your auth headers here
                    // 'Authorization': `Bearer ${yourAuthToken}`,
                },
            });

            setUploadState(prev => ({ ...prev, progress: 75 }));

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            setUploadState(prev => ({ ...prev, progress: 100 }));

            // Return the uploaded image URL from your backend
            const imageUrl = result.imageUrl || result.url || result.avatar_url;

            if (onSuccess && imageUrl) {
                onSuccess(imageUrl);
            }

            return imageUrl;

        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
            Alert.alert('Upload Failed', `${errorMessage}. Please try again.`);

            if (onError) {
                onError(errorMessage);
            }

            return null;
        } finally {
            setTimeout(() => {
                setUploadState({ isUploading: false, progress: 0 });
            }, 1000);
        }
    }, [uploadEndpoint, onSuccess, onError]);

    // Handle image selection and upload
    const handleImageSelection = useCallback(async (result: ImagePicker.ImagePickerResult) => {
        if (!result.canceled && result.assets[0]) {
            const imageUri = result.assets[0].uri;

            const isValid = await validateImage(imageUri);
            if (isValid) {
                await uploadImage(imageUri);
            }
        }
    }, [validateImage, uploadImage]);

    // Capture from camera
    const captureFromCamera = useCallback(async (): Promise<void> => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1], // Square aspect ratio for avatars
                quality,
                exif: false, // Remove metadata for privacy
            });

            await handleImageSelection(result);
        } catch (error) {
            console.error('Camera capture error:', error);
            Alert.alert('Error', 'Failed to capture image from camera');
            if (onError) {
                onError('Failed to capture image from camera');
            }
        }
    }, [requestPermissions, quality, handleImageSelection, onError]);

    // Select from gallery
    const selectFromGallery = useCallback(async (): Promise<void> => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1], // Square aspect ratio for avatars
                quality,
                exif: false,
                allowsMultipleSelection: false,
            });

            await handleImageSelection(result);
        } catch (error) {
            console.error('Photo selection error:', error);
            Alert.alert('Error', 'Failed to select image from gallery');
            if (onError) {
                onError('Failed to select image from gallery');
            }
        }
    }, [requestPermissions, quality, handleImageSelection, onError]);

    return {
        uploadState,
        captureFromCamera,
        selectFromGallery,
        isUploading: uploadState.isUploading,
    };
};
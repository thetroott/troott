import { ReactNode } from 'react';
import {
    StyleProp,
    NativeSyntheticEvent,
    NativeTouchEvent,
    TextStyle,
    ViewStyle,
    ImageStyle,
    ImageSourcePropType,
    ImageResizeMode,
} from 'react-native';

import { Control } from 'react-hook-form';
import { ImageName, IMAGES } from '../assets/images/images';

// export interface IIcon extends SvgProps {
//   name: IconName;
//   size?: number;
//   style?: StyleProp<ViewStyle>;
//   iconColor?: string;
//   stroke?: string;
//   iconOpacity?: number;
//   strokeWidth?: number;
//   focused?: boolean;
// }

export interface IImage {
    name: keyof typeof IMAGES;
    size?: number;
    style?: StyleProp<ImageStyle>;
    source?: ImageSourcePropType;
    resizeMode?: ImageResizeMode;
    onPress?: (event: NativeSyntheticEvent<NativeTouchEvent>) => void;
}

// export interface IButton {
//   title: string;
//   disabled: boolean;
//   loading: boolean;
//   alignSelf?: ViewStyle["alignSelf"];
//   style?: Partial<ViewStyle>;
//   backgroundColor?: Palette | string;
//   color?: Palette | string;
//   left?: ReactNode;
//   right?: ReactNode;
//   borderRadius?: Spacing | number;
//   paddingVertical?: Spacing | number;
//   variant?: "primary" | "outline" | "opacity" | "grey" | string
//   onPress: () => void;
// }

export interface ITextInput {
    id: string;
    value: string;
    label?: string;
    labelStyle?: Partial<ViewStyle>;
    placeholder?: string;
    placeholderColor?: string;
    onChangeText: (val: string) => void;
    keyboardType?:
        | 'default'
        | 'email-address'
        | 'numeric'
        | 'phone-pad'
        | 'url';
    variant?: 'outline' | 'filled' | 'transparent';
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    backgroundColor?: string;
    borderRadius?: number;
    paddingVertical?: number;
    secureTextEntry?: boolean;
    disabled?: boolean;
    width?: number | string;
    style?: Partial<ViewStyle>;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    maxLength?: number;
    clearButton?: boolean;
}

export interface IPasswordInput {
    id: string;
    value: string;
    label?: string;
    labelStyle?: Partial<ViewStyle>;
    placeholder?: string;
    placeholderColor?: string;
    onChangeText: (val: string) => void;
    keyboardType?:
        | 'default'
        | 'email-address'
        | 'numeric'
        | 'phone-pad'
        | 'url';
    variant?: 'outline' | 'filled' | 'transparent';
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
    onTogglePassword?: () => void;
    showPasswordIcon?: React.ReactNode;
    hidePasswordIcon?: React.ReactNode;
    backgroundColor?: string;
    borderRadius?: number;
    paddingVertical?: number;
    secureTextEntry?: boolean;
    disabled?: boolean;
    style?: Partial<ViewStyle>;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    maxLength?: number;
}

export interface IOTPInput {
    id: string;
    value: string;
    label?: string;
    labelStyle?: Partial<ViewStyle>;
    onChangeText: (otp: string) => void;
    onSubmit?: (otp: string) => void;
    backgroundColor?: string;
    borderRadius?: number;
    paddingVertical?: number;
    disabled?: boolean;
    style?: Partial<ViewStyle>;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    length?: number;
}

export interface IWelcomeScreen {
    navigation: any;
}

// export interface ITextInput {
//   backgroundColor: Palette;
//   label: string;
//   name: string;
//   error?: string;
//   placeholder?: string;
//   left?: IconName;
//   leftOnPress: (event: NativeSyntheticEvent<NativeTouchEvent>) => void;
//   right?: IconName;
//   rightOnPress: (event: NativeSyntheticEvent<NativeTouchEvent>) => void;
//   control: Control<any, any>;
//   editable?: boolean;
//   onPress?: (event: NativeSyntheticEvent<NativeTouchEvent>) => void;
//   onFocus?: Function;
//   onBlur?: Function;
//   multiline?: boolean;
//   numberOfLines?: number;
//   secureTextEntry?: boolean;
//   containerStyle?: TextStyle;
//   textStyle?: TextStyle;
// }

// export interface IPPasswordInput {
//   title: string;
//   label: string;
//   placeholder?: string;
//   backgroundColor: Palette;
//   name: string;
//   errors?: string;
//   control: Control<any, any>;
//   inpuRight?: IconName;
//   inputLeft?: IconName;
//   editable?: boolean;
//   multiline?: boolean;
//   numberOfLines?: number;
//   inputRightOnPress?: (event: NativeSyntheticEvent<NativeTouchEvent>) => void;
//   inputLeftOnPress?: (event: NativeSyntheticEvent<NativeTouchEvent>) => void;
// }

export interface ICheckbox {
    title: string;
    name: string;
    control: Control<any, any>;
    checked: boolean;
    onPress: () => void;
}

// export interface IControl {
//   onPress: () => void;
//   name: IconName;
//   size: number;
// }

export interface ISlider {
    title: string;
    data: any[];
    renderItem: ({ item }: { item: any }) => any;
    keyExtractor: (item: any, index: number) => string;
    rootStyles?: ViewStyle;
    imageContainerStyles?: ViewStyle;
}

export type ISearchInput = {
    value: string;
    title?: string;
    placeholder?: string;
    errors?: any;
    name?: string;
    onChangeText: (val: string) => void;
    onClear?: () => void;
    backgroundColor?: string;
    borderRadius?: number;
    style?: object;
};

export interface IStorage {
    keepData: (key: string, data: object | string) => Promise<void>;
    getData: (key: string) => Promise<string | null>;
    getJSON: (key: string) => Promise<any | null>;
    checkData: (key: string) => Promise<boolean>;
    updateData: (key: string, newData: object | string) => Promise<void>;
    mergeData: (key: string, newData: object) => Promise<void>;
    removeData: (key: string) => Promise<void>;
    clearAll: () => Promise<void>;
    multiKeep: (
        items: { key: string; data: object | string }[],
    ) => Promise<void>;
    multiFetch: (keys: string[]) => Promise<{ [key: string]: any | null }>;
    multiRemove: (keys: string[]) => Promise<void>;
}

// Define your interfaces as needed
// Assuming ISetData, IGetData, and IRemoveCookie are defined elsewhere
export interface ISetData {
    key: string;
    payload: string | object;
    // Other properties like expireAt, maxAge are not applicable for Keychain
}

export interface IGetData {
    key: string;
    parse?: boolean;
}

export interface IRemoveData {
    key: string;
}

export interface IOAuth {
    onGooglePress: () => void;
    onApplePress: () => void;
}

export interface IApiError {
    response?: {
        status: number;
        data?: {
            message?: string;
            detail?: string;
            errors?: Array<string>;
        };
        headers?: Record<string, string>;
    };
    code?: string;
    message?: string;
}

export interface IResult {
    [x: string]: any;
    error: boolean;
    message: string;
    code: number;
    data: any;
}

export interface IAPIResponse {
    error: boolean;
    errors: Array<any>;
    count?: number;
    total?: number;
    pagination?: IPagination;
    data: any;
    message: string;
    token?: string;
    status: number;
}

export interface IPagination {
    next: { page: number; limit: number };
    prev: { page: number; limit: number };
}

export interface MediaSourceInfo {
    Protocol?: string | null;
    Path?: string | null;
    Container?: string | null;
    Size?: number | null;
    Bitrate?: number | null;
    HasSegments?: boolean;
}

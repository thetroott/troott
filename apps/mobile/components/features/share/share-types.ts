import type { ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

import type { SermonItemDTO } from '@/api/dtos/sermon.dto';

export type ShareActionItem = {
    id: string;
    label: string;
    icon?: ReactNode;
    onPress?: () => void;
};

export type ShareTargetItem = {
    id: string;
    label: string;
    icon?: ReactNode;
    iconSource?: ImageSourcePropType;
    onPress?: () => void;
};

export type ShareTrack = Pick<
    SermonItemDTO,
    'id' | 'title' | 'minister' | 'image' | 'artwork' | 'shareableUrl'
>;

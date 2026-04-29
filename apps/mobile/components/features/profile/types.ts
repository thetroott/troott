export type ProfileMenuItem = {
    id: string;
    label: string;
    highlighted?: boolean;
    onPress?: () => void;
};

export type ProfilePlaylistItem = {
    id: string;
    title: string;
    category: string;
    author: string;
    metric: string;
    image: number;
};

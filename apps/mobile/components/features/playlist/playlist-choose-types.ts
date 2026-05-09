export type ChoosePlaylistListItem = {
    id: string;
    title: string;
    /** Must match server playlist `playlistType` when calling PATCH add item. */
    playlistType?: string;
};

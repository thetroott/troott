/**
 * Catalog row `sourceType` discriminator values (`SermonItemDTO.sourceType`).
 * Used for display helpers (e.g. placeholder labels in search / lists).
 */
export const Models = {
    Category: 'category',
    Image: 'image',
    Minister: 'minister',
    Playlist: 'playlist',
    Series: 'series',
    Sermon: 'sermon',
    Topic: 'topic',
} as const;

export type CatalogModelKey = keyof typeof Models;
export type CatalogModelValue = (typeof Models)[CatalogModelKey];

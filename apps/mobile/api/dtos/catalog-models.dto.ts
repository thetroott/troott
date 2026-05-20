/**
 * Catalog `sourceType` / entity keys for search and list UIs.
 * Extend when new API-backed catalog types appear (admin / minister surfaces).
 */
export const Models = {
    Admin: 'admin',
    Category: 'category',
    Creator: 'creator',
    Image: 'image',
    Invitation: 'invitation',
    Minister: 'minister',
    Playlist: 'playlist',
    Series: 'series',
    Sermon: 'sermon',
    Subscription: 'subscription',
    Topic: 'topic',
    Transaction: 'transaction',
} as const;

export type CatalogModelKey = keyof typeof Models;
export type CatalogModelValue = (typeof Models)[CatalogModelKey];
